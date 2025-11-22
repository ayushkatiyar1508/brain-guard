import Dashboard from './pages/Dashboard';
import Monitoring from './pages/Monitoring';
import Alerts from './pages/Alerts';
import DailyRoutines from './pages/DailyRoutines';
import Exercises from './pages/Exercises';
import VideoCall from './pages/VideoCall';
import NotFound from './pages/NotFound';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Dashboard',
    path: '/',
    element: <Dashboard />,
    visible: true
  },
  {
    name: 'Monitoring',
    path: '/monitoring',
    element: <Monitoring />,
    visible: true
  },
  {
    name: 'Alerts',
    path: '/alerts',
    element: <Alerts />,
    visible: true
  },
  {
    name: 'Daily Routines',
    path: '/routines',
    element: <DailyRoutines />,
    visible: true
  },
  {
    name: 'Exercises',
    path: '/exercises',
    element: <Exercises />,
    visible: true
  },
  {
    name: 'Video Call',
    path: '/video-call',
    element: <VideoCall />,
    visible: true
  },
  {
    name: 'Not Found',
    path: '/404',
    element: <NotFound />,
    visible: false
  }
];

export default routes;