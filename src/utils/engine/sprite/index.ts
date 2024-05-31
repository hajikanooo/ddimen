import { Container, Sprite, Texture } from 'pixi.js';
import { DDComponent } from '../component';
import { DDEntity } from '../entity';
import { DDTransformComponent } from '../transform';

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

  initListeners(): boolean {
    const transformComp = this.entity.getComponent(DDTransformComponent);
    if (!transformComp) {
      return false;
    }
    transformComp.reigsterUpdateNotifyCb(({ position, rotation, scale }) => {
      this.sprite.position.set(position.x, position.y);
      this.sprite.rotation = rotation;
      this.sprite.scale = scale;
    });
    return true;
  }

  update(_delta: number): void {
    if (!this.transformInitOk) {
      this.initListeners();
    }
  }
}
