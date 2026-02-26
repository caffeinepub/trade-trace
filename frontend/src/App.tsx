import React from 'react';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { TraceDetail } from './pages/TraceDetail';
import { Settings } from './pages/Settings';
import { AlertLog } from './pages/AlertLog';
import { Toaster } from '@/components/ui/sonner';

// Root route with layout
const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

// Child routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
});

const traceDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/trace/$traceId',
  component: TraceDetail,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: Settings,
});

const alertsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/alerts',
  component: AlertLog,
});

// Router
const routeTree = rootRoute.addChildren([indexRoute, traceDetailRoute, settingsRoute, alertsRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster theme="dark" position="bottom-right" />
    </>
  );
}
