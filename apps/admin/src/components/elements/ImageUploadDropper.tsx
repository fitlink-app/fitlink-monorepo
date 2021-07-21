import { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'
import IconUpload from '../icons/IconUpload'

export type ImageUploadDropperProps = {
  onChange?: (files) => void
}

export default function ImageUploadDropper({
  onChange
}:ImageUploadDropperProps) {
  const [hover, setHover] = useState(false)
  const [total, setTotal] = useState(0)
  const [files, setFiles] = useState([])
  const ref = useRef()

  const classes = clsx({
    'image-upload': true,
    'image-upload--hover': hover,
  })

  useEffect(() => {
    const div = ref.current || null
    div.addEventListener('dragenter', handleDragIn)
    div.addEventListener('dragleave', handleDragOut)
    div.addEventListener('dragover', handleDrag)
    div.addEventListener('drop', handleDrop)

    return () => {
      div.removeEventListener('drop', handleDrop)
    }
  }, [])

  useEffect(() => {
    if (onChange && (total === files.length) && total > 0) {
      onChange(files)
      setTotal(0)
      setFiles([])
    }
  }, [files])

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setHover(true)
  }
  const handleDragIn = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setHover(true)
  }
  const handleDragOut = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setHover(false)
  }
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setHover(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {

      setTotal(total + Array.from(e.dataTransfer.files).filter((f:any) => f.type.startsWith('image')).length)
      
      for (let i=0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i]
        if (file.type.startsWith('image')) {
          const img = new Image()
          img.onload = function() {
            setFiles(files => [...files, { src: img.src, width: img.width, height: img.height}])
          }
          img.src = URL.createObjectURL(file)
        }
      }
    }
  }

  return (
    <div className={classes} ref={ref}>
      <IconUpload />
      <span>Drop or select images to upload</span>
    </div>
  )
}