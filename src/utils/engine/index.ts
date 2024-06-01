import { Ticker } from 'pixi.js';

export function pixiSetTimeout({
  ticker,
  delay,
  callback,
}: {
  ticker: Ticker;
  delay: number;
  callback: () => void;
}): void {
  const startTime = ticker.lastTime;
  const targetTime = startTime + delay;

  const tick = (ticker: Ticker) => {
    if (ticker.lastTime >= targetTime) {
      ticker.remove(tick);
      callback();
    }
  };

  ticker.add(tick);
}
