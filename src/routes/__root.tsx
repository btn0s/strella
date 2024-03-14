import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

function RootRoute() {
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  );
}

export const Route = createRootRoute({
  component: RootRoute,
});
