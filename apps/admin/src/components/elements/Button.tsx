import Link from 'next/link'
import clsx from 'clsx'

type ButtonProps = {
  to: string
  label: string
  alt?: boolean
  className?: string
}

export default function Button({
  to,
  label,
  alt = false,
  className = ''
}: ButtonProps) {
  const classes = clsx({
    button: true,
    'button--alt': alt,
    [className]: true
  })
  return (
    <Link href={to}>
      <a className={classes}>
        {label}
      </a>
    </Link>
  )
}