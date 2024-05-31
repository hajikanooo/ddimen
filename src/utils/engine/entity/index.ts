import { Application } from 'pixi.js';
import { DDComponent } from '../component';

export class DDEntity {
  components: DDComponent[];

  app: Application;

  constructor({ app }: { app: Application }) {
    this.components = [];
    this.app = app;
  }

  addComponent(component: DDComponent): void {
    this.components.push(component);
  }

  getComponent<T extends DDComponent>(
    type: new (...args: any[]) => T,
  ): T | undefined {
    return this.components.find(comp => comp instanceof type) as T | undefined;
  }

  update(delta: number): void {
    this.components.forEach(comp => {
      if (comp.enabled) {
        comp.update(delta);
      }
    });
  }
}

export class DDEntityManager {
  entities: DDEntity[];

  constructor() {
    this.entities = [];
  }

  createEntity({ app }: { app: Application }): DDEntity {
    const entity = new DDEntity({ app });
    this.entities.push(entity);
    return entity;
  }

  update(delta: number): void {
    this.entities.forEach(entity => entity.update(delta));
  }
}
