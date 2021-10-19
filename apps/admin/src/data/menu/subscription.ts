import { Primary } from '../../context/Auth.context'

export default function MenuSubscription(primary: Primary) {
  return [
    {
      label: 'Billing',
      link: `/subscriptions/${primary.subscription}`,
      icon: 'IconCreditCard'
    },
    {
      label: 'Help Center 🡕',
      link:
        'https://support.fitlinkapp.com/en/collections/3167640-fitlink-billing',
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
