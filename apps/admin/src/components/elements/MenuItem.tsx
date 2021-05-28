import Link from 'next/link'
import clsx from 'clsx'

export type MenuItemProps = {
  icon: React.ReactNode
  to: string
  label: string
  current?: boolean
}

export default function MenuItem({
  icon,
  to,
  label,
  current = false
}: MenuItemProps) {
  const classes = clsx({
    'menu-item': true,
    'current': current
  })
  return (
    <Link href={to}>
      <a className={classes}>
        {icon}
        {label}
      </a>
    </Link>
  )
}