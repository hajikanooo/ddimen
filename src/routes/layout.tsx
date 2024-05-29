import { Outlet } from '@modern-js/runtime/router';
import './index.css';
import { Container } from '@chakra-ui/react';

export default function Layout() {
  return (
    <Container className="w-screen h-screen">
      <Outlet />
    </Container>
  );
}
