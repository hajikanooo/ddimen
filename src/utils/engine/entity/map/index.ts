import { Sprite, Assets } from 'pixi.js';
import { LayerOrder } from '@shared/layer_order';
import { DDEntity } from '..';
import { DDAirWall } from '../dd_air_wall';

export class DDMap extends DDEntity {
  backPathList: string[] = [];

  frontPathList: string[] = [];

  airWallList: DDAirWall[] = [];

  constructor({
    backPathList,
    frontPathList,
  }: {
    frontPathList: string[];
    backPathList: string[];
  }) {
    super();
    this.backPathList = backPathList;
    this.frontPathList = frontPathList;
  }

  async load(): Promise<void> {
    const {
      backPathList,
      frontPathList,
      airWallList,
      controller,
    } = this;
    if (!controller) {
      return;
    }

    backPathList.forEach(path => {
      Assets.load(path).then(val => {
        const sprite = new Sprite(val);
        sprite.zIndex = LayerOrder.BACK_01;
        sprite.label = path;
        controller.addObjectToScene(sprite);
      });
    });
    frontPathList.forEach(path => {
      Assets.load(path).then(val => {
        const sprite = new Sprite(val);
        sprite.zIndex = LayerOrder.FRONT_01;
        sprite.label = path;
        controller.addObjectToScene(sprite);
      });
    });
    airWallList.forEach(wall => {
      wall.render();
    });
  }
}
