import { DDComponent } from '../components/base';
import { DDGameController } from '../game_controller';

export class DDEntity {
  components: DDComponent[];

  controller: DDGameController | null = null;

  constructor() {
    this.components = [];
  }

  addComponent(component: DDComponent): void {
    this.components.push(component);
  }

  getComponent<T extends DDComponent>(
    type: new (...args: any[]) => T,
  ): T | undefined {
    return this.components.find(
      comp => comp instanceof type,
    ) as T | undefined;
  }

  update(delta: number): void {
    this.components.forEach(comp => {
      if (comp.enabled) {
        comp.update(delta);
      }
    });
  }

  destroy(): void {
    this.components.forEach(comp => {
      if (comp.enabled) {
        comp.destroy();
      }
    });
  }
}

export class DDEntityManager {
  entities: DDEntity[];

  constructor() {
    this.entities = [];
  }

  createEntity(): DDEntity {
    const entity = new DDEntity();
    this.entities.push(entity);
    return entity;
  }

  addEntity({ entity }: { entity: DDEntity }): DDEntity {
    this.entities.push(entity);
    return entity;
  }

  update(delta: number): void {
    this.entities.forEach(entity => entity.update(delta));
  }

  destroy() {
    this.entities.forEach(entity => {
      entity.destroy();
    });
  }
}
