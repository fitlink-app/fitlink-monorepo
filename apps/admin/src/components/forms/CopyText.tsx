import { useRef, useEffect } from 'react'
import ClipboardJS from 'clipboard'

export default function CopyText({ text, setCopied }) {
  const ref = useRef()

  useEffect(() => {
    const clipboard = new ClipboardJS(ref.current, {
      text: () => text
    })
    clipboard.on('success', function () {
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 5000)
    })
  }, [])

  return (
    <span ref={ref} className="copy-text button small">
      COPY
    </span>
  )
}
