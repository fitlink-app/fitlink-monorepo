export default function MenuUser() {
  return [
    {
      label: 'Settings',
      link: '/settings/profile',
      icon: 'IconGear'
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
