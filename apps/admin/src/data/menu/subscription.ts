import { Primary } from '../../context/Auth.context'

export default function MenuSubscription(primary: Primary) {
  return [
    {
      label: 'Billing',
      link: `/subscriptions/${primary.subscription}`,
      icon: 'IconCreditCard'
    },
    { hr: true },
    {
      label: 'Sign out',
      link: '/logout',
      icon: 'IconSignOut'
    }
  ]
}