import {
  Application,
  ApplicationOptions,
  Assets,
  Container,
  Ticker,
} from 'pixi.js';
import { Engine, Vector } from 'matter-js';
import machi_chann_idle_00 from 'config/public/images/characters/machi_chann/idle_00.png';
import { MAIN_CAMEAR_LABEL, MAIN_GRID_LABEL } from 'shared';
import { MAIN_PLAYER_LABEL } from '@shared/labels';
import { LayerOrder } from '@shared/layer_order';
import { DDEntity, DDEntityManager } from '../entity';
import { VirtualCamera } from '../camera';
import { DDSpriteComponent } from '../components/sprite';
import { DDPhysicsComponent } from '../components/physics';
import { DDMovementComponent } from '../components/movement';
import { IDDControllerHooks } from './typing';
import { DDGrid } from '@/utils/engine/entity/dd_grid';
import { DDClassRoomMap } from '@/data/maps/classroom';

// TODO
// 1. DDGameController 的功能太杂了 考虑拆分
// 2. DDEntityManager 需要管理哪些 Entity？哪些需要成为 Entity ？
// 3. Entity 有什么不依赖 DDGameController 的方法？ 现在会有循环依赖
// 4. 实现一个 SceneManager 支持动态加载区块 区块内部加载若干个地图
// 5. 空气墙支持位图形式上传 支持动态增删改空气墙
// 6. 动画系统的支持
// 7. GUI系统的支持
export class DDGameController {
  ctn: HTMLElement;

  app: Application;

  entityManager: DDEntityManager;

  hooks: IDDControllerHooks;

  appSettings: Partial<ApplicationOptions>;

  physicsEngine: Engine;

  mainCamera: VirtualCamera;

  started: boolean = false;

  constructor({
    ctn,
    hooks = {},
    appSettings = {},
  }: {
    ctn: HTMLElement;
    hooks?: IDDControllerHooks;
    appSettings?: Partial<ApplicationOptions>;
  }) {
    this.ctn = ctn;
    this.hooks = hooks;
    this.appSettings = appSettings;

    this.app = new Application();
    this.entityManager = new DDEntityManager();
    this.physicsEngine = Engine.create({
      gravity: {
        scale: 0,
      },
    });
    this.mainCamera = new VirtualCamera({
      app: this.app,
      label: MAIN_CAMEAR_LABEL,
    });

    this.devModeInit();
  }

  get world() {
    return this.physicsEngine.world;
  }

  async init(): Promise<DDGameController> {
    await this.initApp();
    await this.initGrid();
    return this;
  }

  async initApp(): Promise<DDGameController> {
    const { hooks, app, ctn, appSettings } = this;
    hooks?.beforeInit?.({ controller: this });

    await app.init({
      background: '#000',
      resizeTo: ctn,
      autoStart: false,
      ...appSettings,
    });
    ctn.innerHTML = '';
    ctn.appendChild(app.canvas);

    app.ticker.add(ticker => {
      this.update(ticker);
    });

    hooks?.afterDestroy?.({ controller: this });

    return this;
  }

  async initGrid(): Promise<DDGameController> {
    // 创建PixiJS应用
    const { mainCamera, app } = this;
    const { viewport } = mainCamera;

    const grid = new DDGrid({
      parent: viewport,
      gridWidth: app.screen.width * 2,
      gridHeight: app.screen.height * 2,
      cellWidth: 32,
      lineWidth: 0,
    });
    grid.container.label = MAIN_GRID_LABEL;
    this.addEntity({ entity: grid });

    // 添加图形到应用中
    grid.generate().draw();

    return this;
  }

  getWorldPosition({
    screenPosition,
  }: {
    screenPosition: Vector;
  }): Vector {
    const { viewport } = this.mainCamera;
    return Vector.create(
      screenPosition.x - viewport.x,
      screenPosition.y - viewport.y,
    );
  }

  start() {
    const { app } = this;
    app.render();
    app.start();
    this.started = true;
  }

  update(ticker: Ticker) {
    const { mainCamera, physicsEngine, entityManager } =
      this;
    mainCamera.update();
    Engine.update(physicsEngine, ticker.deltaMS);
    entityManager.update(ticker.deltaMS);
  }

  devModeInit() {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    const { app, mainCamera, entityManager } = this;
    // @ts-expect-error
    window.app = app;
    // @ts-expect-error __PIXI_APP__
    window.__PIXI_APP__ = app;
    // @ts-expect-error
    window.entityManager = entityManager;
    // @ts-expect-error
    window.mainCamera = mainCamera;
  }

  setMainCameraFollow({
    entity,
  }: {
    entity: DDEntity;
  }): DDGameController {
    this.mainCamera.followTarget = entity;
    return this;
  }

  destroy(): DDGameController {
    const { /* app, */ hooks, entityManager } = this;
    hooks.beforeDestroy?.({ controller: this });

    entityManager.destroy();
    // app.destroy();

    hooks.afterDestroy?.({ controller: this });

    return this;
  }

  addObjectToScene(ctn: Container) {
    const { mainCamera, app } = this;
    mainCamera.viewport.addChild(ctn);
    app.render();
  }

  initEntity({
    entity,
  }: {
    entity: DDEntity;
  }): DDGameController {
    entity.controller = this;
    return this;
  }

  createEntity(): DDEntity {
    const { entityManager } = this;
    const entity = entityManager.createEntity();
    this.initEntity({ entity });
    return entity;
  }

  addEntity({
    entity,
  }: {
    entity: DDEntity;
  }): DDGameController {
    const { entityManager } = this;
    entityManager.addEntity({ entity });
    this.initEntity({ entity });
    return this;
  }

  async addPlayer(): Promise<DDEntity> {
    const { app, physicsEngine } = this;

    const entity = this.createEntity();

    const texture = await Assets.load(machi_chann_idle_00);
    const spriteComponent = new DDSpriteComponent({
      entity,
      texture,
      options: {
        eventMode: 'static',
        cursor: 'pointer',
      },
    });
    const initPosition = Vector.create(
      app.screen.width / 2,
      app.screen.height / 2,
    );
    spriteComponent.setPosition(initPosition);
    spriteComponent.setScale({
      scaleX: 0.35,
      scaleY: 0.35,
    });
    spriteComponent.sprite.anchor.set(0.5);
    spriteComponent.sprite.zIndex = LayerOrder.INSTANCE_00;
    spriteComponent.sprite.label = MAIN_PLAYER_LABEL;
    entity.addComponent(spriteComponent);
    this.setMainCameraFollow({ entity });
    this.addObjectToScene(spriteComponent.sprite);

    const physicsComponent = new DDPhysicsComponent({
      entity,
      world: physicsEngine.world,
    });
    entity.addComponent(physicsComponent);

    const movementComponent = new DDMovementComponent({
      entity,
    });
    entity.addComponent(movementComponent);

    return entity;
  }

  async addBackground(): Promise<void> {
    const map = new DDClassRoomMap({ controller: this });
    this.addEntity({ entity: map });
    await map.load();
  }
}
