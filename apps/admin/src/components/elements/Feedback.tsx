import clsx from 'clsx'
import React from 'react'
import IconClose from '../icons/IconClose'

export type FeedbackProps = {
  type?: 'success' | 'error' | 'default'
  message: string | React.ReactNode
  dismissable?: boolean
  remove?: () => void
  className?: string
}

export default function Feedback({
  type = 'default',
  message,
  dismissable = false,
  remove = () => {},
  className
}: FeedbackProps) {
  const classes = clsx({
    feedback: true,
    [`feedback--${type}`]: true,
    [className]: className
  })

  return (
    <div className={classes}>
      {dismissable && <IconClose onClick={remove} />}
      {message}
    </div>
  )
}
