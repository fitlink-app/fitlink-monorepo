export default function MenuUser() {
  return [
    {
      label: 'Settings',
      link: '/settings/profile',
      icon: 'IconGear'
    },
    {
      label: 'App Store',
      link: '/app-store',
      icon: 'IconMobile'
    },
    { hr: true },
    {
      label: 'Sign out',
      link: '/logout',
      icon: 'IconSignOut'
    }
  ]
}
