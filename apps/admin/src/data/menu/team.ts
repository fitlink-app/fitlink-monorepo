import { Primary } from '../../context/Auth.context'

export default function MenuTeam(primary: Primary) {
  return [
    {
      label: 'Overview',
      link: '/dashboard',
      icon: 'IconGraph'
    },
    {
      label: 'Users',
      link: '/users',
      icon: 'IconFriends'
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
    { hr: true },
    {
      label: 'App Store',
      link: '/app-store',
      icon: 'IconMobile'
    },
    {
      label: 'Help Center',
      link: 'https://intercom.help/fitlinkapp',
      icon: 'IconInfo'
    },
    { hr: true },
    {
      label: 'Settings',
      link: '/settings',
      icon: 'IconGear'
    },
    {
      label: 'Manage Page',
      link: '/settings/page',
      icon: 'IconGear'
    },
    {
      label: 'My Profile',
      link: '/settings/profile',
      icon: 'IconGear'
    },
    { hr: true },
    {
      label: 'Sign out',
      link: '/logout',
      icon: 'IconSignOut'
    }
  ]
}
