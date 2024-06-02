import { Bodies, Body, Vector, World } from 'matter-js';
import { DDComponent } from '../base';
import { DDEntity } from '../../entity';

export class DDPhysicsComponent extends DDComponent {
  body: Body;

  constructor({
    entity,
    world,
    size = Vector.create(32, 64),
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
    const spriteComp = this.getSpriteComponent();
    if (!spriteComp) {
      throw new Error('spriteComponent is undefined!');
    }
    return spriteComp.worldPosition;
  }

  override initListeners(): boolean {
    return true;
  }

  setPosition(pos: Vector): void {
    Body.setPosition(this.body, pos);
    Body.setSpeed(this.body, 0);
  }

  setRotation({ rotation }: { rotation: number }): void {
    this.body.angle = rotation;
  }

  update(_delta: number): void {
    const spriteComp = this.getSpriteComponent();
    if (!spriteComp) {
      return;
    }
    spriteComp.setPosition({
      x: this.body.position.x,
      y: this.body.position.y,
    });
    spriteComp.setRotation({
      rotation: this.body.angle,
    });
  }
}
