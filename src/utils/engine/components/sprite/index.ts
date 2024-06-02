import { Container, Sprite, Texture } from 'pixi.js';
import { Vector } from 'matter-js';
import { DDComponent } from '../base';
import { DDEntity } from '../../entity';
import { DDPhysicsComponent } from '../physics';

export class DDSpriteComponent extends DDComponent {
  sprite: Sprite;

  transformInitOk: boolean = false;

  constructor({
    ctn,
    entity,
    texture,
    options,
  }: {
    ctn?: Container;
    entity: DDEntity;
    texture: Texture;
    options?: Partial<Sprite>;
  }) {
    super({ entity });
    this.sprite = new Sprite(texture);
    Object.assign(this.sprite, options);
    ctn?.addChild(this.sprite);
    this.initListeners();
  }

  override initListeners(): boolean {
    return true;
  }

  get screenPosition(): Vector {
    const { tx, ty } = this.sprite.worldTransform;
    return Vector.create(tx, ty);
  }

  get worldPosition(): Vector {
    const { screenPosition, entity } = this;
    const { controller } = entity;
    if (!controller) {
      return Vector.create(
        screenPosition.x,
        screenPosition.y,
      );
    }
    return Vector.clone(
      controller.getWorldPosition({
        screenPosition,
      }),
    );
  }

  update(_delta: number): void {
    if (!this.transformInitOk) {
      this.initListeners();
    }
  }

  setPosition({ x, y }: Vector): void {
    this.sprite.x = x;
    this.sprite.y = y;
    const physicsComp = this.entity.getComponent(
      DDPhysicsComponent,
    );
    if (physicsComp) {
      physicsComp.setPosition(Vector.create(x, y));
    }
  }

  setRotation({ rotation }: { rotation: number }): void {
    this.sprite.rotation = rotation;
  }

  setScale({
    scaleX = 1,
    scaleY = 1,
  }: {
    scaleX?: number;
    scaleY?: number;
  }): void {
    this.sprite.scale.set(scaleX, scaleY);
  }
}
