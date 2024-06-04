import classroom_front from 'config/public/images/maps/classroom/classroom_front.png';
import classroom_back from 'config/public/images/maps/classroom/classroom_back.png';
import { DDMap } from '@/utils/engine/entity/map';
import { DDAirWall } from '@/utils/engine/entity/dd_air_wall';
import { DDGameController } from '@/utils/engine/game_controller';

const tile1 = {
  row: 1,
  col: 1,
  xStart: 32,
  xEnd: 64,
  yStart: 32,
  yEnd: 64,
};
const tile2 = {
  row: 21,
  col: 1,
  xStart: 32,
  xEnd: 64,
  yStart: 672,
  yEnd: 704,
};
const tile3 = {
  row: 21,
  col: 30,
  xStart: 960,
  xEnd: 992,
  yStart: 672,
  yEnd: 704,
};
const tile4 = {
  row: 1,
  col: 30,
  xStart: 960,
  xEnd: 992,
  yStart: 32,
  yEnd: 64,
};

export class DDClassRoomMap extends DDMap {
  constructor({
    controller,
  }: {
    controller: DDGameController;
  }) {
    super({
      frontPathList: [classroom_front],
      backPathList: [classroom_back],
    });
    this.controller = controller;
    const airWall = new DDAirWall({
      tiles: [tile1, tile2, tile3, tile4],
      closed: true,
    });
    controller.addEntity({ entity: airWall });
    this.airWallList = [airWall];
  }
}
