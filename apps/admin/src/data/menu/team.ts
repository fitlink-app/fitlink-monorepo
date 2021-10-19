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
      label: 'Settings',
      link: '/settings',
      icon: 'IconGear',
      subMenu: [
        {
          label: 'Manage Page',
          link: '/settings/page'
        },
        {
          label: 'My Profile',
          link: '/settings/profile'
        }
      ]
    },
    {
      label: 'Knowledge Base',
      link: '/knowledge-base',
      icon: 'IconYoga'
    },
    {
      label: 'App Store',
      link: '/app-store',
      icon: 'IconMobile'
    },
    {
      label: 'Help Center 🡕',
      link: 'https://support.fitlinkapp.com/en/',
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
