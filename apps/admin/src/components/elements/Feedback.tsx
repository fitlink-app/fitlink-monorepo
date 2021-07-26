import clsx from "clsx"
import IconClose from "../icons/IconClose"

export type FeedbackProps = {
  type?: 'success' | 'error' | 'default'
  message: string
  dismissable?: boolean
  remove?: () => void
}

export default function Feedback({
  type = 'default',
  message,
  dismissable = false,
  remove = () => {}
}:FeedbackProps) {

  const classes = clsx({
    feedback: true,
    [`feedback--${type}`]: true
  })

  return (
    <div className={classes}>
      { dismissable &&
        <IconClose onClick={remove} />
      }
      {message}
    </div>
  )
}