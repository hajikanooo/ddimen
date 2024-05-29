import { Box, Center } from '@chakra-ui/react';
import { Application } from 'pixi.js';
import { useEffect, useRef } from 'react';
import { initApp } from '@/utils/engine';
import { DDEntityManager } from '@/utils/engine/entity';
import { DDTransformComponent } from '@/utils/engine/transform';

const Index = () => {
  const appRef = useRef<Application | null>(null);
  const entityManagerRef = useRef<DDEntityManager | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const entityManager = entityManagerRef.current;
      const target = entityManager?.entities[0];
      if (!target) {
        return;
      }
      const transformComp = target.getComponent(DDTransformComponent);
      if (!transformComp) {
        return;
      }
      const { x, y } = transformComp.position;
      const step = 30;
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
    <Center className="w-full h-full">
      <Box>
        <div
          ref={async el => {
            if (!el) {
              return;
            }
            const { app, entityManager } = await initApp({ ctn: el });
            appRef.current = app;
            entityManagerRef.current = entityManager;
          }}
        />
      </Box>
    </Center>
  );
};

export default Index;
