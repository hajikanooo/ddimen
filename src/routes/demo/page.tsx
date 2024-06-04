import { Box, Center } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { DDGameController } from '@/utils/engine/game_controller';

export async function main({
  controller,
}: {
  controller: DDGameController;
}) {
  await controller.addBackground();
  await controller.addPlayer();
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
