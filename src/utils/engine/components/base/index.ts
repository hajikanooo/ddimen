import { DDEntity } from '../../entity';

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

  update(_delta: number): void {
    /*  */
  }
}
