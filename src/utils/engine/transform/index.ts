import { Vector } from 'matter-js';
import { Point } from 'pixi.js';
import { DDComponent } from '../component';
import { DDEntity } from '../entity';

type TransformUpdateCallback<T extends DDComponent = DDComponent> = (
  transformComp: DDTransformComponent,
  source?: new (...args: any[]) => T,
) => void;

export class DDTransformComponent extends DDComponent {
  position: Vector;

  scale: Point;

  rotation: number;

  private updateCallbacks: TransformUpdateCallback[];

  constructor({
    entity,
    x,
    y,
    rotation = 0,
    scaleX = 1,
    scaleY = 1,
  }: {
    entity: DDEntity;
    x: number;
    y: number;
    rotation?: number;
    scaleX?: number;
    scaleY?: number;
  }) {
    super({ entity });
    this.position = Vector.create(x, y);
    this.scale = new Point(scaleX, scaleY);
    this.rotation = rotation;
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

  setScale<T extends DDComponent>({
    scaleX = 1,
    scaleY = 1,
    source,
  }: {
    scaleX?: number;
    scaleY?: number;
    source?: new (...args: any[]) => T;
  }): void {
    this.scale.set(scaleX, scaleY);
    this.notifyUpdate({ source });
  }

  setRotation<T extends DDComponent>({
    rotation,
    source,
  }: {
    rotation: number;
    source?: new (...args: any[]) => T;
  }): void {
    this.rotation = rotation;
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
