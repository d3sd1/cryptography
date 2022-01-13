import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'Personal space',
    group: true,
  },
  {
    title: 'Logout',
    icon: 'log-out-outline',
    link: '/auth/login/layouts',
    home: true,
  },
  {
    title: 'Bank',
    group: true,
  },
  {
    title: 'Transactions',
    icon: 'activity-outline',
    children: [
      {
        title: 'Historical',
        link: '/pages/tables/smart-table',
        icon: 'clipboard-outline',
      },
      {
        title: 'Send money',
        link: '/pages/layout/stepper',
        icon: 'shuffle-outline',
      },
    ],
  },
];
