import Link from 'next/link'

export type MenuItemProps = {
  icon: React.ReactNode
  to: string
  label: string
}

export default function MenuItem({
  icon,
  to,
  label
}: MenuItemProps) {
  return (
    <Link href={to}>
      <a className="menu-item">
        {icon}
        {label}
      </a>
    </Link>
  )
}