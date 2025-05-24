import React from 'react';

// Lazy-loaded page components to improve initial load time
const Home = React.lazy(() => import('../pages/Home'));
const Events = React.lazy(() => import('../pages/Events'));
const EventDetail = React.lazy(() => import('../pages/EventDetail'));
const Places = React.lazy(() => import('../pages/Places'));
const PlaceDetail = React.lazy(() => import('../pages/PlaceDetail'));
const Rewards = React.lazy(() => import('../pages/Rewards'));
const RewardDetail = React.lazy(() => import('../pages/RewardDetail'));
const Quizzes = React.lazy(() => import('../pages/Quizzes'));
const QuizDetail = React.lazy(() => import('../pages/QuizDetail'));
const Connectivity = React.lazy(() => import('../pages/Connectivity'));
const Emergency = React.lazy(() => import('../pages/Emergency'));
const Chat = React.lazy(() => import('../pages/Chat'));
const Profile = React.lazy(() => import('../pages/Profile/Profile'));

/**
 * Application routes configuration
 * Contains all application routes with their corresponding components
 * and access control settings
 */
export const routes = [
  {
    path: '/',
    component: Home,
    exact: true,
    private: false,
    title: 'nav.home',
  },
  {
    path: '/events',
    component: Events,
    exact: true,
    private: false,
    title: 'nav.events',
  },
  {
    path: '/events/:id',
    component: EventDetail,
    exact: true,
    private: false,
    title: 'events.details',
  },
  {
    path: '/places',
    component: Places,
    exact: true,
    private: false,
    title: 'nav.places',
  },
  {
    path: '/places/:id',
    component: PlaceDetail,
    exact: true,
    private: false,
    title: 'places.details',
  },
  {
    path: '/rewards',
    component: Rewards,
    exact: true,
    private: false,
    title: 'nav.rewards',
  },
  {
    path: '/rewards/:id',
    component: RewardDetail,
    exact: true,
    private: false,
    title: 'rewards.details',
  },
  {
    path: '/quizzes',
    component: Quizzes,
    exact: true,
    private: false,
    title: 'nav.quizzes',
  },
  {
    path: '/quizzes/:id',
    component: QuizDetail,
    exact: true,
    private: true, // Quiz participation requires login
    title: 'quizzes.title',
  },
  {
    path: '/connectivity',
    component: Connectivity,
    exact: true,
    private: false,
    title: 'nav.connectivity',
  },
  {
    path: '/emergency',
    component: Emergency,
    exact: true,
    private: false,
    title: 'nav.emergency',
  },
  {
    path: '/chat',
    component: Chat,
    exact: true,
    private: false, // Chat is accessible to all, but some features might require login
    title: 'nav.chat',
  },
  {
    path: '/profile',
    component: Profile,
    exact: true,
    private: true, // Profile page requires authentication
    title: 'nav.profile',
  },
];

/**
 * Navigation menu items
 * This is used for the main navigation and is a subset of all routes
 * that should appear in navigation menus
 */
export const navMenuItems = routes.filter(
  (route) => 
    !['/events/:id', '/places/:id', '/rewards/:id', '/quizzes/:id'].includes(route.path)
);

/**
 * Get a route by path
 * @param {string} path - Route path to find
 * @returns {Object|undefined} The route object or undefined if not found
 */
export const getRouteByPath = (path) => {
  return routes.find((route) => route.path === path);
};

/**
 * Check if a route requires authentication
 * @param {string} path - Route path to check
 * @returns {boolean} True if the route requires authentication
 */
export const isPrivateRoute = (path) => {
  const route = getRouteByPath(path);
  return route ? route.private : false;
};