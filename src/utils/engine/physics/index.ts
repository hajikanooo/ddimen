import { Bodies, Body, Vector, World } from 'matter-js';
import { DDComponent } from '../component';
import { DDEntity } from '../entity';
import { DDTransformComponent } from '../transform';

export class DDPhysicsComponent extends DDComponent {
  body: Body;

  constructor({
    entity,
    world,
    size = Vector.create(50, 50),
  }: {
    entity: DDEntity;
    world: World;
    size?: Vector;
  }) {
    super({ entity });
    const { x, y } = this.entityPosition;
    const body = Bodies.rectangle(x, y, size.x, size.y);
    this.body = body;
    World.add(world, this.body);
    this.initListeners();
  }

  get entityPosition() {
    const transformComp = this.entity.getComponent(DDTransformComponent);
    if (!transformComp) {
      throw new Error('transformComponent is undefined!');
    }
    return transformComp.position;
  }

  initListeners() {
    const transformComp = this.entity.getComponent(DDTransformComponent);
    if (!transformComp) {
      return;
    }
    transformComp.reigsterUpdateNotifyCb(({ position, rotation }, source) => {
      if (source instanceof DDPhysicsComponent) {
        return;
      }
      Body.setPosition(this.body, position);
      Body.setAngle(this.body, rotation);
    });
  }

  update(_delta: number): void {
    const transformComp = this.entity.getComponent(DDTransformComponent);
    if (!transformComp) {
      return;
    }
    transformComp.setPosition({
      x: this.body.position.x,
      y: this.body.position.y,
      source: DDPhysicsComponent,
    });
    transformComp.setRotation({
      rotation: this.body.angle,
      source: DDPhysicsComponent,
    });
  }
}
