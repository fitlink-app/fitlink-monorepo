import { useState, useEffect, useRef } from 'react'
import clsx from 'clsx'
import IconClose from '../icons/IconClose'

export type DrawerProps = {
  children: React.ReactNode
  warnBeforeClose?: boolean
  onClose?: () => void
}

export default function Drawer({
  children,
  warnBeforeClose = false,
  onClose
}) {
  const node = useRef()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (children)
      setOpen(true)
  }, [children])

  const handleClickOutside = e => {
    const ref = node.current || null
    if (ref.contains(e.target)) {
      return;
    }
    if (warnBeforeClose) {
      const res = confirm('Are you sure you want to exit without saving?')
      setOpen(!res)
    } else {
      setOpen(false)
    }
  }

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
      setTimeout(function() {
        onClose()
      }, 150)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const drawClass = clsx({
    'drawer': true,
    'open': open
  })

  return (
    <div ref={node} className={drawClass}>
      <div className="drawer__close" onClick={ () => setOpen(false) }>
        <IconClose />
      </div>
      {children}
    </div>
  )
}