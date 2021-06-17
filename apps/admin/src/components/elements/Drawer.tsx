import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import IconClose from '../icons/IconClose'

export type DrawerProps = {
  children: React.ReactNode
  warnBeforeClose?: boolean
  remove: () => void
}

export default function Drawer({ children, warnBeforeClose = false, remove }) {
  const node = useRef()
  const [mustWarn, setMustWarn] = useState(false)

  const handleClickOutside = (e) => {
    const ref = node.current || null
    if (ref.contains(e.target)) {
      return
    }
    e.stopPropagation()
    e.stopImmediatePropagation()
    if (mustWarn) {
      const res = confirm('Are you sure you want to exit without saving?')
      if (res) {
        setMustWarn(false)
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
      const form = document.querySelector('.drawer form')
      form.addEventListener('change', () => {
        if (warnBeforeClose) setMustWarn(true)
      })
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, mustWarn])

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
