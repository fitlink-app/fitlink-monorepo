import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import IconClose from '../icons/IconClose'

export type DrawerProps = {
  children: React.ReactNode
  warnBeforeClose?: boolean
  remove: () => void
}

export default function Drawer({
  children,
  warnBeforeClose = false,
  remove
}) {
  const node = useRef()
  //const [open, setOpen] = useState(false)

  /* useEffect(() => {
    if (children)
      setOpen(true)
  }, [children]) */

  const handleClickOutside = e => {
    const ref = node.current || null
    if (ref.contains(e.target)) {
      return;
    }
    e.stopPropagation()
    e.stopImmediatePropagation()
    if (warnBeforeClose) {
      const res = confirm('Are you sure you want to exit without saving?')
      if (res) remove()
      //setOpen(!res)
    } else {
      remove()
      //setOpen(false)
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

  /* const drawClass = clsx({
    'drawer': true,
    'open': open
  }) */

  return (
    <AnimatePresence>
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
          x: '100%'
        }}
        >
        <div className="drawer__close" onClick={ remove }>
          <IconClose />
        </div>
        {children}
      </motion.div>
    </AnimatePresence>
  )
}