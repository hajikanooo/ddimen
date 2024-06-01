import { Vector } from 'matter-js';
import { DDEntity } from '../../entity';
import { DDComponent } from '../base';

export class DDMovementComponent extends DDComponent {
  static KEY_SETS: Set<string> = new Set([
    'w',
    's',
    'a',
    'd',
  ]);

  keyDownSet: Set<string> = new Set();

  baseSpeed: number = 1;

  running: boolean = false;

  runningScale: number = 2;

  constructor({ entity }: { entity: DDEntity }) {
    super({ entity });
    this.initListeners();
  }

  isKeyPressed(key: string) {
    const { keyDownSet } = this;
    return keyDownSet.has(key);
  }

  onKeyDown = (e: KeyboardEvent) => {
    const { keyDownSet } = this;
    const key = e.key.toLowerCase();
    if (DDMovementComponent.KEY_SETS.has(key)) {
      keyDownSet.add(key);
    }
    if (e.shiftKey) {
      this.running = !this.running;
    }
    return this;
  };

  onKeyUp = (e: KeyboardEvent) => {
    const { keyDownSet } = this;
    const key = e.key.toLowerCase();
    if (DDMovementComponent.KEY_SETS.has(key)) {
      keyDownSet.delete(key);
    }
    return this;
  };

  get direction(): Vector {
    const dir = Vector.create(0, 0);
    if (this.isKeyPressed('w')) {
      dir.y -= 1;
    }
    if (this.isKeyPressed('s')) {
      dir.y += 1;
    }
    if (this.isKeyPressed('a')) {
      dir.x -= 1;
    }
    if (this.isKeyPressed('d')) {
      dir.x += 1;
    }
    return dir;
  }

  get speed(): number {
    const { baseSpeed, runningScale } = this;
    let speed = baseSpeed;
    if (this.running) {
      speed *= runningScale;
    }
    return speed;
  }

  override initListeners(): boolean {
    const { onKeyDown, onKeyUp } = this;
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return true;
  }

  movement() {
    const { direction, speed } = this;
    const magnitude = Vector.magnitude(direction);
    if (!magnitude) {
      return;
    }
    const transformComp = this.getTransformComp();
    if (!transformComp) {
      return;
    }
    const { position } = transformComp;
    const newPos = Vector.add(
      position,
      Vector.mult(direction, speed),
    );
    transformComp.setPosition(newPos);
  }

  update(_delta: number): void {
    this.movement();
  }

  destroy(): boolean {
    const { onKeyDown, onKeyUp } = this;
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    return true;
  }
}
