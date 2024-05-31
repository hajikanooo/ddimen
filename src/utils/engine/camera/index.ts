import { Application, Container } from 'pixi.js';
import { DDEntity } from '../entity';
import { DDTransformComponent } from '../transform';

export class VirtualCamera {
  public followTarget: DDEntity | null = null;

  private app: Application;

  private viewport: Container;

  private followSpeed: number;

  private offsetX: number;

  private offsetY: number;

  constructor({
    app,
    followSpeed = 0.1,
    offsetX = 0,
    offsetY = 0,
  }: {
    app: Application;
    followSpeed?: number;
    offsetX?: number;
    offsetY?: number;
  }) {
    this.app = app;
    this.viewport = app.stage;
    this.followSpeed = followSpeed;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  update(): void {
    if (!this.followTarget) {
      return;
    }
    const transformComp = this.followTarget.getComponent(DDTransformComponent);
    if (!transformComp) {
      return;
    }
    const targetX =
      transformComp.screenPostion.x + this.offsetX - this.app.screen.width / 2;
    const targetY =
      transformComp.screenPostion.y + this.offsetY - this.app.screen.height / 2;

    this.viewport.x = -(targetX - this.viewport.x);
    this.viewport.y = -(targetY - this.viewport.y);
  }
}
