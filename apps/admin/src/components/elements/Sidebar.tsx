import Logo from './Logo'
import MainMenu from './MainMenu'

export type SidebarProps = {
  superAdmin?: boolean
}

export default function Sidebar({
  superAdmin = false,
}: SidebarProps) {
  return(
    <div className="sidebar">
      <Logo />
      <div className="sidebar__menu">
        { !superAdmin &&
          <MainMenu />
        }
      </div>
    </div>
  )
}