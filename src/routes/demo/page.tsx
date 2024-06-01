import { Box, Center } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { DDGameController } from '@/utils/engine/game_controller';
import { DDGrid } from '@/utils/graphics/dd_grid';

export async function main({
  controller,
}: {
  controller: DDGameController;
}) {
  await controller.addBackground();
  const player = await controller.addPlayer();
  controller.setMainCameraFollow({ entity: player });
}

export async function drawGrid({
  cellWidth,
  lineWidth,
  controller,
}: {
  cellWidth: number;
  lineWidth: number;
  controller: DDGameController;
}) {
  // 创建PixiJS应用
  const { app } = controller;

  const grid = new DDGrid({
    controller,
    gridWidth: app.screen.width,
    gridHeight: app.screen.height,
    cellWidth,
    lineWidth,
  });

  // 添加图形到应用中
  grid.generate().draw({ parent: app.stage });

  return grid;
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

          // 调用函数绘制宫格
          drawGrid({
            cellWidth: 32,
            lineWidth: 0,
            controller,
          });

          main({ controller });

          controller.app.stage.interactive = true;
          controller.app.stage.cursor = 'pointer';
          controller.start();
        }}
      />
    </Center>
  );
};

export default Index;
