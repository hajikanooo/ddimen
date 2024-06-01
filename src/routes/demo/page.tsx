import { Box, Center } from '@chakra-ui/react';
import { Application } from 'pixi.js';
import { useEffect, useRef } from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { DDEntityManager } from '@/utils/engine/components/entity';
import { DDTransformComponent } from '@/utils/engine/components/transform';
import { initApp } from '@/utils/engine';

const Index = () => {
  const appRef = useRef<Application | null>(null);
  const entityManagerRef = useRef<DDEntityManager | null>(
    null,
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const entityManager = entityManagerRef.current;
      const target = entityManager?.entities[0];
      if (!target) {
        return;
      }
      const transformComp = target.getComponent(
        DDTransformComponent,
      );
      if (!transformComp) {
        return;
      }
      const { x, y } = transformComp.position;
      const step = 10;
      if (e.key === 'w') {
        transformComp.setPosition({ x, y: y - step });
      }
      if (e.key === 's') {
        transformComp.setPosition({ x, y: y + step });
      }
      if (e.key === 'a') {
        transformComp.setPosition({ x: x - step, y });
      }
      if (e.key === 'd') {
        transformComp.setPosition({ x: x + step, y });
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
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
