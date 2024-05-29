import { Vector } from 'matter-js';
import { DDComponent } from '../component';
import { DDEntity } from '../entity';

type TransformUpdateCallback<T extends DDComponent = DDComponent> = (
  transformComp: DDTransformComponent,
  source?: new (...args: any[]) => T,
) => void;

export class DDTransformComponent extends DDComponent {
  position: Vector;

  angle: number;

  private updateCallbacks: TransformUpdateCallback[];

  constructor({
    entity,
    x,
    y,
    angle = 0,
  }: {
    entity: DDEntity;
    x: number;
    y: number;
    angle?: number;
  }) {
    super({ entity });
    this.position = Vector.create(x, y);
    this.angle = angle;
    this.updateCallbacks = [];
  }

  reigsterUpdateNotifyCb(callback: TransformUpdateCallback): void {
    this.updateCallbacks.push(callback);
  }

  setPosition<T extends DDComponent>({
    x,
    y,
    source,
  }: {
    x: number;
    y: number;
    source?: new (...args: any[]) => T;
  }): void {
    this.position.x = x;
    this.position.y = y;
    this.notifyUpdate({ source });
  }

  setAngle<T extends DDComponent>({
    angle,
    source,
  }: {
    angle: number;
    source?: new (...args: any[]) => T;
  }): void {
    this.angle = angle;
    this.notifyUpdate({ source });
  }

  private notifyUpdate<T extends DDComponent>({
    source,
  }: {
    source?: new (...args: any[]) => T;
  }): void {
    this.updateCallbacks.forEach(cb => {
      cb(this, source);
    });
  }

  update(_delta: number): void {
    /*  */
  }
}
