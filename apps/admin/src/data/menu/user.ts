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
    {
      label: 'Help Center',
      link: 'https://support.fitlinkapp.com/en/collections/3158686-fitlink-app',
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
