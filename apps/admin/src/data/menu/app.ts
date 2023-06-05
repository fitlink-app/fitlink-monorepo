import { Primary } from '../../context/Auth.context'

export default function MenuApp(primary: Primary) {
  return [
    {
      label: 'Overview',
      link: '/dashboard',
      icon: 'IconGear'
    },
    {
      label: 'Organisations',
      link: '/organisations',
      icon: 'IconGear'
    },
    {
      label: 'Subscriptions',
      link: '/subscriptions',
      icon: 'IconGear'
    },
    {
      label: 'Users',
      link: '/users',
      icon: 'IconFriends',
      subMenu: [
        {
          label: 'Admins',
          link: '/admins/global'
        }
      ]
    },
    {
      label: 'Rewards',
      link: '/rewards',
      icon: 'IconRewards'
    },
    {
      label: 'Leagues',
      link: '/leagues',
      icon: 'IconLeagues'
    },
    {
      label: 'Activities',
      link: '/activities',
      icon: 'IconActivities'
    },
    {
      label: 'Global Configuration',
      link: '/global-config',
      icon: 'IconGear'
    },
    {
      label: 'Debug Trackers',
      link: '/health-activities',
      icon: 'IconGear'
    },
    { hr: true },
    {
      label: 'App Store',
      link: '/app-store',
      icon: 'IconMobile'
    },
    {
      label: 'Help Centre',
      link: '/help-centre',
      icon: 'IconInfo'
    },
    { hr: true },
    {
      label: 'Sign out',
      link: '/logout',
      icon: 'IconSignOut'
    }
  ]
}
