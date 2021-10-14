import Logo from './Logo'
import MainMenu, { MenuProps } from './MainMenu'

export type SidebarProps = {
  menu?: MenuProps[]
  superAdmin?: boolean
  prefix?: string
}

export default function Sidebar({
  menu = [],
  superAdmin = false,
  prefix = ''
}: SidebarProps) {
  return (
    <div className="sidebar">
      <Logo />
      <div className="sidebar__menu">
        {!superAdmin && <MainMenu prefix={prefix} menu={menu} />}
      </div>
    </div>
  )
}
