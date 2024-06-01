import { Box, Center } from '@chakra-ui/react';
import { Application } from 'pixi.js';
import { useRef } from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { DDEntityManager } from '@/utils/engine/entity';
import { initApp } from '@/utils/engine';

const Index = () => {
  const appRef = useRef<Application | null>(null);
  const entityManagerRef = useRef<DDEntityManager | null>(
    null,
  );

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
          const { app, entityManager } = await initApp({
            ctn: el,
          });
          appRef.current = app;
          entityManagerRef.current = entityManager;
        }}
      />
    </Center>
  );
};

export default Index;
