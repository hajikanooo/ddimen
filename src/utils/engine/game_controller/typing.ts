import { DDGameController } from '.';

export interface IDDControllerHooks {
  beforeInit?: ({
    controller,
  }: {
    controller: DDGameController;
  }) => void;
  beforeDestroy?: ({
    controller,
  }: {
    controller: DDGameController;
  }) => void;
  afterInit?: ({
    controller,
  }: {
    controller: DDGameController;
  }) => void;
  afterDestroy?: ({
    controller,
  }: {
    controller: DDGameController;
  }) => void;
}
