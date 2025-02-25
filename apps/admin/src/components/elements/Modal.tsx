import { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import clsx from 'clsx'
import IconClose from '../icons/IconClose'

export type ModalProps = {
  children?: React.ReactNode
  className?: string
  size?: 'full' | 'large' | 'message'
  hideCloseButton?: boolean
  close: () => void
}

export default function Modal({
  children,
  className,
  size,
  hideCloseButton = false,
  close = () => {}
}:ModalProps) {
  const [isBrowser, setIsBrowser] = useState(false)

  useEffect(() => {
    setIsBrowser(true)
  }, [])

  const classes = clsx({
    modal: true,
    [className]: className,
    [`modal--${size}`]: size
  })

  const handleClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    close()
  }

  if (isBrowser) {
    return ReactDOM.createPortal(
      <div className={classes}>
        <div className="modal__content">
          { !hideCloseButton && <IconClose className="modal__close" onClick={handleClick} /> }
          { children }
        </div>
      </div>, 
      document.getElementById("modal-root")
    )
  } else {
    return null
  }
}