import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import IconClose from '../icons/IconClose'

export type DrawerProps = {
  children: React.ReactNode
  warnBeforeClose?: boolean
  remove: () => void
}

export default function Drawer({ children, warnBeforeClose = false, remove }) {
  const node = useRef()

  const handleClickOutside = (e) => {
    const ref = node.current || null
    if (ref.contains(e.target)) {
      return
    }
    e.stopPropagation()
    e.stopImmediatePropagation()
    if (warnBeforeClose) {
      const res = confirm('Are you sure you want to exit without saving?')
      if (res) {
        warnBeforeClose = false
        remove()
      }
    } else {
      remove()
    }
    return false
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

  return (
    <motion.div
      ref={node}
      className="drawer"
      initial={{
        x: '100%'
      }}
      animate={{
        x: 0,
        transition: { duration: 0.15 }
      }}
      exit={{
        x: '100%',
        transition: { duration: 0.15 }
      }}>
      <div className="drawer__close" onClick={remove}>
        <IconClose />
      </div>
      {children}
    </motion.div>
  )
}
