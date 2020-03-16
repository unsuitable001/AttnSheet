
import HomePage from '../pages/home.f7.html';
import AboutPage from '../pages/about.f7.html';
import LicensePage from '../pages/license.f7.html';
import createClassPage from '../pages/createclass.f7.html';
import classPage from '../pages/class.f7.html';
import attendancePage from '../pages/attendance.f7.html';
import addClassPage from '../pages/addclass.f7.html';
import DashboardPage from '../pages/dashboard.f7.html';
import SettingsPage from '../pages/settings.f7.html';
import NotFoundPage from '../pages/404.f7.html';

var routes = [
  {
    path: '/',
    component: HomePage,
  },
  {
    path: '/about/',
    component: AboutPage,
  },
  {
    path: '/license/',
    component: LicensePage,
  },
  {
    path: '/attendance/:id/',
    component: attendancePage,
  },
  {
    path: '/dashboard/',
    component: DashboardPage,
  },
  {
    path: '/settings/',
    component: SettingsPage,
  },
  {
    path: '/newclass/',
    component: createClassPage,
  },
  {
    path: '/class/:id/',
    component: classPage,
  },
  {
    path: '/addclass/',
    component: addClassPage,
  },
  {
    path: '(.*)',
    component: NotFoundPage,
  },
];

export default routes;