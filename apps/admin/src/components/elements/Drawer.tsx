import { useState, useEffect, useRef } from 'react'
import clsx from 'clsx'

export type DrawerProps = {
  children: React.ReactNode
  warnBeforeClose?: boolean
}

export default function Drawer({
  children,
  warnBeforeClose = false
}) {
  const node = useRef()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (children)
      setOpen(true)
  }, [children])

  const handleClickOutside = e => {
    if (node.current.contains(e.target)) {
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
      {children}
    </div>
  )
}