import Logo from './Logo'
import MainMenu from './MainMenu'

export type SidebarProps = {
  superAdmin?: boolean
  prefix?: string
}

export default function Sidebar({
  superAdmin = false,
  prefix = ''
}: SidebarProps) {
  return (
    <div className="sidebar">
      <Logo />
      <div className="sidebar__menu">
        {!superAdmin && <MainMenu prefix={prefix} />}
      </div>
    </div>
  )
}
