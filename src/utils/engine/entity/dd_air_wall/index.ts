import { Container, Graphics } from 'pixi.js';
import { DDTile } from '@shared/typing';
import { Bodies, Body, Composite } from 'matter-js';
import { LayerOrder } from '@shared/layer_order';
import { DDEntity } from '@/utils/engine/entity';

export class DDAirWall extends DDEntity {
  container: Container = new Container({
    zIndex: LayerOrder.AIR_WALL,
  });

  tiles: DDTile[];

  closed: boolean;

  constructor({
    tiles,
    closed = false,
  }: {
    tiles: DDTile[];
    closed?: boolean;
  }) {
    super();
    this.tiles = tiles;
    this.closed = closed;
  }

  drawRectangleFromTiles() {
    const { tiles, closed } = this;
    const rectangles: Body[] = [];
    const pixiGraphics: Graphics[] = [];

    const addRectangle = (tile1: DDTile, tile2: DDTile) => {
      // 计算矩形的 x 和 y 的最小和最大值
      const xMin = Math.min(
        tile1.xStart,
        tile1.xEnd,
        tile2.xStart,
        tile2.xEnd,
      );
      const xMax = Math.max(
        tile1.xStart,
        tile1.xEnd,
        tile2.xStart,
        tile2.xEnd,
      );
      const yMin = Math.min(
        tile1.yStart,
        tile1.yEnd,
        tile2.yStart,
        tile2.yEnd,
      );
      const yMax = Math.max(
        tile1.yStart,
        tile1.yEnd,
        tile2.yStart,
        tile2.yEnd,
      );

      // 计算矩形的中心点、宽度和高度
      const centerX = (xMin + xMax) / 2;
      const centerY = (yMin + yMax) / 2;
      const width = xMax - xMin;
      const height = yMax - yMin;

      const rectangle = Bodies.rectangle(
        centerX,
        centerY,
        width,
        height,
        {
          isStatic: true,
        },
      );
      rectangles.push(rectangle);

      const graphics = new Graphics();
      graphics.rect(xMin, yMin, width, height).fill({
        color: '#FCA2A2',
        alpha: 0.5,
      });
      pixiGraphics.push(graphics);
    };

    // 遍历 tiles 数组，按照顺序两两生成矩形
    for (let i = 0; i < tiles.length - 1; i++) {
      addRectangle(tiles[i], tiles[i + 1]);
    }

    // 检查 close 参数是否为 true，如果是，则将最后一个 tile 与第一个 tile 闭合
    if (closed && tiles.length > 1) {
      addRectangle(tiles[tiles.length - 1], tiles[0]);
    }

    return { rectangles, pixiGraphics };
  }

  render() {
    const { controller, container } = this;
    if (!controller) {
      return;
    }
    const { rectangles, pixiGraphics } =
      this.drawRectangleFromTiles();
    Composite.add(controller.world, [...rectangles]);
    container.addChild(...pixiGraphics);
    controller.addObjectToScene(container);
  }
}
