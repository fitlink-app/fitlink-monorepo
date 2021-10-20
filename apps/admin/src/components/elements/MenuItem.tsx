import Link from 'next/link'
import clsx from 'clsx'

export type MenuItemProps = {
  icon: React.ReactNode
  endIcon?: React.ReactNode
  to: string
  label: string
  current?: boolean
  onClick?: () => void
}

export default function MenuItem({
  icon,
  endIcon,
  to,
  label,
  current = false,
  onClick
}: MenuItemProps) {
  const classes = clsx({
    'menu-item': true,
    current: current,
    pointer: true
  })

  if (onClick) {
    return (
      <a className={classes} onClick={onClick}>
        {icon}
        <span>{label}</span>
        {endIcon}
      </a>
    )
  }

  return (
    <Link href={to}>
      <a
        className={classes}
        target={to.indexOf('http') === 0 ? '_blank' : '_self'}>
        {icon}
        <span>{label}</span>
        {endIcon}
      </a>
    </Link>
  )
}
