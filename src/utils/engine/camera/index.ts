import { Application, Container } from 'pixi.js';
import { DDEntity } from '../entity';
import { DDTransformComponent } from '../components/transform';

function isSameDir(num1: number, num2: number): boolean {
  // 获取两个数字的符号
  const sign1 = Math.sign(num1);
  const sign2 = Math.sign(num2);
  // 如果任意一个数字是0，则它们在同一个方向
  if (sign1 === 0 || sign2 === 0) {
    return true;
  }
  // 比较两个数字的符号
  return sign1 === sign2;
}

export class VirtualCamera {
  public followTarget: DDEntity | null = null;

  private app: Application;

  private viewport: Container;

  private followSpeed: number;

  private offsetX: number;

  private offsetY: number;

  private threshold: number;

  private preTargetX: number = 0;

  private preTargetY: number = 0;

  constructor({
    app,
    followSpeed = 0.1,
    offsetX = 0,
    offsetY = 0,
    threshold = 10,
  }: {
    app: Application;
    followSpeed?: number;
    offsetX?: number;
    offsetY?: number;
    threshold?: number;
  }) {
    this.app = app;
    this.viewport = app.stage;
    this.followSpeed = followSpeed;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.threshold = threshold;
  }

  update(): void {
    if (!this.followTarget) {
      return;
    }
    const transformComp = this.followTarget.getComponent(
      DDTransformComponent,
    );
    if (!transformComp) {
      return;
    }
    let targetX =
      transformComp.screenPostion.x +
      this.offsetX -
      this.app.screen.width / 2;
    let targetY =
      transformComp.screenPostion.y +
      this.offsetY -
      this.app.screen.height / 2;

    this.viewport.x -= targetX;
    this.viewport.y -= targetY;
    return;

    // 使用线性插值平滑移动视口
    if (targetX && isSameDir(targetX, this.preTargetX)) {
      this.viewport.x +=
        (this.viewport.x - targetX) * this.followSpeed;
    } else if (targetX) {
      this.viewport.x -= targetX;
      targetX = 0;
    }
    if (targetY && isSameDir(targetY, this.preTargetY)) {
      this.viewport.y +=
        (this.viewport.y - targetY) * this.followSpeed;
    } else if (targetY) {
      this.viewport.y -= targetY;
      targetY = 0;
    }

    this.preTargetX = targetX;
    this.preTargetY = targetY;
  }
}
