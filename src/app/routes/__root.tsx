import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: () => (
    <div className="h-screen w-screen flex flex-col">
      <Outlet />
      {/*<TanStackRouterDevtools />*/}
    </div>
  ),
});
