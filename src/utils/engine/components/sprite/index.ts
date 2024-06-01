import { Container, Sprite, Texture } from 'pixi.js';
import { DDComponent } from '../base';
import { DDEntity } from '../../entity';

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
    const transformComp = this.getTransformComp();
    if (!transformComp) {
      return false;
    }
    transformComp.reigsterUpdateNotifyCb(
      ({ position, rotation, scale }) => {
        this.sprite.position.set(position.x, position.y);
        this.sprite.rotation = rotation;
        this.sprite.scale = scale;
      },
    );
    return true;
  }

  update(_delta: number): void {
    if (!this.transformInitOk) {
      this.initListeners();
    }
  }
}
