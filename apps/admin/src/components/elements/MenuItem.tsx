import Link from 'next/link'
import clsx from 'clsx'

export type MenuItemProps = {
  icon: React.ReactNode
  endIcon?: React.ReactNode
  to: string
  label: string
  current?: boolean
  id?: string
  onClick?: () => void
}

export default function MenuItem({
  icon,
  endIcon,
  to,
  label,
  current = false,
  id = '',
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
        id={id || (to.indexOf('http') === -1 ? to.split('/').join('_') : '')}
        target={to.indexOf('http') === 0 ? '_blank' : '_self'}>
        {icon}
        <span>{label}</span>
        {endIcon}
      </a>
    </Link>
  )
}
