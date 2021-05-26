import Link from 'next/link'
import clsx from 'clsx'

export type ButtonProps = {
  to: string
  label: string
  alt?: boolean
  className?: string
  external?: boolean
}

export default function Button({
  to,
  label,
  alt = false,
  className = '',
  external = false
}: ButtonProps) {
  const classes = clsx({
    button: true,
    'button--alt': alt,
    [className]: true
  })

  if (external) {
    return (
      <a className={classes} href={to} target="_blank" rel="noopener noreferrer">{label}</a>
    )
  }
  
  return (
    <Link href={to}>
      <a className={classes}>{label}</a>
    </Link>
  )
}
