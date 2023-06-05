import { OrganisationMode } from '@fitlink/api/src/modules/organisations/organisations.constants'
import { Primary } from '../../context/Auth.context'

export function MenuOrganisationComplex(primary: Primary) {
  return [
    {
      label: 'Overview',
      link: '/dashboard',
      icon: 'IconGear'
    },
    {
      label: 'Users',
      link: '/users',
      icon: 'IconFriends',
      subMenu: [
        {
          label: 'Admins',
          link: '/admins/organisation'
        }
      ]
    },
    {
      label: 'Teams',
      link: '/teams',
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
      label: 'Subscriptions',
      link: '/subscriptions',
      icon: 'IconCreditCard'
    },
    {
      label: 'Knowledge Base',
      link: '/knowledge-base',
      icon: 'IconInfo'
    },
    {
      label: 'App Store',
      link: '/app-store',
      icon: 'IconMobile'
    },
    {
      label: 'Help Center',
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

export function MenuOrganisationSimple(primary: Primary) {
  return [
    {
      label: 'Overview',
      link: '/dashboard',
      icon: 'IconGraph'
    },
    {
      label: 'Users',
      link: '/users',
      icon: 'IconFriends',
      subMenu: [
        {
          label: 'Admins',
          link: '/admins/team'
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
      label: 'Billing',
      link: `/subscriptions/${primary.subscription}`,
      icon: 'IconCreditCard',
      id: '_billing'
    },
    {
      label: 'Knowledge Base',
      link: '/knowledge-base',
      icon: 'IconInfo'
    },
    {
      label: 'App Store',
      link: '/app-store',
      icon: 'IconMobile'
    },
    {
      label: 'Help Center',
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
