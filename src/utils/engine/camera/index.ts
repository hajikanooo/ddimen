import { Application, Container } from 'pixi.js';
import { DDEntity } from '../entity';
import { DDSpriteComponent } from '../components/sprite';

export function isSameDir(
  num1: number,
  num2: number,
): boolean {
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
  followTarget: DDEntity | null = null;

  label: string;

  viewport: Container;

  private app: Application;

  private offsetX: number;

  private offsetY: number;

  constructor({
    app,
    label,
    offsetX = 0,
    offsetY = 0,
  }: {
    app: Application;
    label: string;
    followSpeed?: number;
    offsetX?: number;
    offsetY?: number;
    threshold?: number;
  }) {
    this.app = app;
    this.label = label;
    this.viewport = new Container({
      label,
    });
    app.stage.addChild(this.viewport);
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  update(): void {
    if (!this.followTarget) {
      return;
    }
    const spriteComp = this.followTarget.getComponent(
      DDSpriteComponent,
    );
    if (!spriteComp) {
      return;
    }
    const { screenPosition } = spriteComp;
    const targetX =
      screenPosition.x +
      this.offsetX -
      this.app.screen.width / 2;
    const targetY =
      screenPosition.y +
      this.offsetY -
      this.app.screen.height / 2;

    this.viewport.x -= targetX;
    this.viewport.y -= targetY;
  }
}
