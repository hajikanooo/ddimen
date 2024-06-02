import {
  Application,
  ApplicationOptions,
  Assets,
  Sprite,
  Ticker,
} from 'pixi.js';
import { Engine, Vector } from 'matter-js';
import machi_chann_idle_00 from 'config/public/images/characters/machi_chann/idle_00.png';
import classroom_back from 'config/public/images/maps/classroom/classroom_back.png';
import classroom_front from 'config/public/images/maps/classroom/classroom_front.png';
import { DDEntity, DDEntityManager } from '../entity';
import { VirtualCamera } from '../camera';
import { DDTransformComponent } from '../components/transform';
import { DDSpriteComponent } from '../components/sprite';
import { DDPhysicsComponent } from '../components/physics';
import { DDMovementComponent } from '../components/movement';
import { IDDControllerHooks } from './typing';
import {
  MAIN_CAMEAR_LABEL,
  MAIN_GRID_LABEL,
} from './constants';
import { DDGrid } from '@/utils/graphics/dd_grid';

export class DDGameController {
  ctn: HTMLElement;

  app: Application;

  entityManager: DDEntityManager;

  hooks: IDDControllerHooks;

  appSettings: Partial<ApplicationOptions>;

  physicsEngine: Engine;

  mainCamera: VirtualCamera;

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
    const { app, mainCamera } = this;
    // @ts-expect-error
    window.app = app;
    // @ts-expect-error __PIXI_APP__
    window.__PIXI_APP__ = app;
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

  addObjectToScene(sprite: Sprite) {
    const { mainCamera } = this;
    mainCamera.viewport.addChild(sprite);
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
    const initPosition = Vector.create(
      app.screen.width / 2,
      app.screen.height / 2,
    );

    const transformComponent = new DDTransformComponent({
      entity,
      x: initPosition.x,
      y: initPosition.y,
    });
    const scale = 0.35;
    transformComponent.setScale({
      scaleX: scale,
      scaleY: scale,
    });
    entity.addComponent(transformComponent);

    const texture = await Assets.load(machi_chann_idle_00);
    const spriteComponent = new DDSpriteComponent({
      entity,
      texture,
      options: {
        eventMode: 'static',
        cursor: 'pointer',
      },
    });
    spriteComponent.sprite.anchor.set(0.5);
    spriteComponent.sprite.zIndex = 1;
    entity.addComponent(spriteComponent);

    const physicsComponent = new DDPhysicsComponent({
      entity,
      world: physicsEngine.world,
    });
    entity.addComponent(physicsComponent);

    const movementComponent = new DDMovementComponent({
      entity,
    });
    entity.addComponent(movementComponent);

    transformComponent.notifyUpdate({
      source: DDTransformComponent,
    });

    this.addObjectToScene(spriteComponent.sprite);

    return entity;
  }

  async addBackground(): Promise<void> {
    const textureClassRoomBack = await Assets.load(
      classroom_back,
    );
    const textureClassRoomFront = await Assets.load(
      classroom_front,
    );
    const spriteBack = new Sprite(textureClassRoomBack);
    spriteBack.zIndex = 0;
    const spriteFront = new Sprite(textureClassRoomFront);
    spriteFront.zIndex = 2;

    this.addObjectToScene(spriteBack);
    this.addObjectToScene(spriteFront);
  }
}
