import { DDEntity } from '../../entity';
import { DDSpriteComponent } from '../sprite';

export class DDComponent {
  entity: DDEntity;

  enabled: boolean;

  constructor({
    entity,
    enabled = true,
  }: {
    entity: DDEntity;
    enabled?: boolean;
  }) {
    this.entity = entity;
    this.enabled = enabled;
  }

  getSpriteComponent() {
    const spriteComp = this.entity.getComponent(
      DDSpriteComponent,
    );
    return spriteComp;
  }

  update(_delta: number): void {
    /*  */
  }

  initListeners(): boolean {
    return true;
  }

  destroy(): boolean {
    return true;
  }
}
