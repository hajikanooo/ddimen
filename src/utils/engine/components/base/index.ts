import { DDEntity } from '../../entity';
import { DDTransformComponent } from '../transform';

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

  getTransformComp() {
    const transformComp = this.entity.getComponent(
      DDTransformComponent,
    );
    return transformComp;
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
