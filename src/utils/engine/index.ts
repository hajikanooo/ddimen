import { Application, Assets, Ticker } from 'pixi.js';
import { Engine, Vector } from 'matter-js';
import { DDEntityManager } from './entity';
import { DDTransformComponent } from './transform';
import { DDSpriteComponent } from './sprite';
import { DDPhysicsComponent } from './physics';

export function pixiSetTimeout({
  ticker,
  delay,
  callback,
}: {
  ticker: Ticker;
  delay: number;
  callback: () => void;
}): void {
  const startTime = ticker.lastTime;
  const targetTime = startTime + delay;

  const tick = (ticker: Ticker) => {
    if (ticker.lastTime >= targetTime) {
      ticker.remove(tick);
      callback();
    }
  };

  ticker.add(tick);
}

export async function initApp({ ctn }: { ctn: HTMLElement }) {
  const entityManager = new DDEntityManager();

  const app = new Application();
  // @ts-expect-error __PIXI_APP
  globalThis.__PIXI_APP = app;

  await app.init({ background: '#aaa', resizeTo: ctn });
  ctn.innerHTML = '';
  ctn.appendChild(app.canvas);

  const physicsEngine = Engine.create({
    gravity: {
      scale: 0,
    },
  });
  const { world } = physicsEngine;
  const entity = entityManager.createEntity();

  const initPosition = Vector.create(
    app.screen.width / 2,
    app.screen.height / 2,
  );

  const transformComponent = new DDTransformComponent({
    entity,
    x: initPosition.x,
    y: initPosition.y,
  });
  entity.addComponent(transformComponent);

  const texture = await Assets.load('https://pixijs.com/assets/bunny.png');
  const spriteComponent = new DDSpriteComponent({
    ctn: app.stage,
    entity,
    texture,
    options: {
      eventMode: 'static',
      cursor: 'pointer',
    },
  });
  entity.addComponent(spriteComponent);
  spriteComponent.sprite.on('pointerdown', () => {
    const transformComp =
      spriteComponent.entity.getComponent(DDTransformComponent);
    if (!transformComp) {
      return;
    }
    const step = 10;
    transformComp.setPosition({
      x: transformComp.position.x,
      y: transformComp.position.y - step,
    });
    pixiSetTimeout({
      ticker: app.ticker,
      delay: 50,
      callback: () => {
        transformComp.setPosition({
          x: transformComp.position.x,
          y: transformComp.position.y + step,
        });
      },
    });
  });

  const physicsComponent = new DDPhysicsComponent({
    entity,
    world,
  });
  entity.addComponent(physicsComponent);

  app.ticker.add(ticker => {
    Engine.update(physicsEngine, ticker.deltaMS);
    entityManager.update(ticker.deltaMS);
  });

  return { app, entityManager };
}
