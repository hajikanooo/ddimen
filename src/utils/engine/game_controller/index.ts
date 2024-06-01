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
import { MAIN_CAMEAR_LABEL } from './constants';

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

  async addPlayer(): Promise<DDEntity> {
    const { entityManager, app, physicsEngine } = this;

    const entity = entityManager.createEntity({ app });
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
