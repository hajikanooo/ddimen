import { Box, Center } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { Bodies, Body, Composite } from 'matter-js';
import styles from './index.module.scss';
import { DDGameController } from '@/utils/engine/game_controller';
import { GridTile } from '@/utils/graphics/dd_grid';

// 计算并绘制矩形的函数
function drawRectangleFromTiles({
  tiles,
  close = false,
}: {
  tiles: GridTile[];
  close?: boolean;
}) {
  const rectangles: Body[] = [];

  const addRectangle = (
    tile1: GridTile,
    tile2: GridTile,
  ) => {
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

    // 创建矩形
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
  };

  // 遍历 tiles 数组，按照顺序两两生成矩形
  for (let i = 0; i < tiles.length - 1; i++) {
    addRectangle(tiles[i], tiles[i + 1]);
  }

  // 检查 close 参数是否为 true，如果是，则将最后一个 tile 与第一个 tile 闭合
  if (close && tiles.length > 1) {
    addRectangle(tiles[tiles.length - 1], tiles[0]);
  }

  return rectangles;
}
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

export async function main({
  controller,
}: {
  controller: DDGameController;
}) {
  await controller.addBackground();
  await controller.addPlayer();

  Composite.add(controller.world, [
    ...drawRectangleFromTiles({
      tiles: [tile1, tile2, tile3, tile4],
      close: true,
    }),
  ]);
}

const Index = () => {
  const controllerRef = useRef<DDGameController | null>(
    null,
  );

  useEffect(() => {
    return () => {
      controllerRef.current?.destroy();
    };
  }, []);

  return (
    <Center
      className={classNames(styles.ctn, 'w-full h-full')}
    >
      <Box
        className={classNames(styles.canvasCtn)}
        ref={async el => {
          if (!el) {
            return;
          }
          const controller = new DDGameController({
            ctn: el,
          });
          controllerRef.current = controller;
          await controller.init();

          main({ controller });
          controller.start();
        }}
      />
    </Center>
  );
};

export default Index;
