import { useEffect, useState } from 'react'
import IconImage from '../icons/IconImage'
import clsx from 'clsx'

export type ImageSelectProps = {
  filename?: string
  removeable?: boolean
  accept?: string
  onChange?: (e: any) => void
  showPreview?: boolean
  label?: string
  backgroundSize?: string
  className?: string
}

export default function ImageSelect({
  filename,
  removeable = false,
  accept = 'image/*',
  onChange,
  showPreview = true,
  label = 'Select an image',
  backgroundSize = 'cover',
  className
}:ImageSelectProps) {
  const [preview, setPreview] = useState(filename || '')
  const classes = clsx({
    'image-select': true,
    [className]: className
  })

  const previewImage = (e) => {
    if (onChange) {
      onChange(e)
    }
    setPreview(URL.createObjectURL(e.target.files[0]))
  }

  return(
    <div className={classes}>
      <input
        type="file"
        id="image"
        onChange={previewImage}
        accept="image/*"
        />
      <IconImage />
      <label htmlFor="image">{label}</label>
      { showPreview &&
        <div
          className="image-select__preview"
          style={{
            backgroundImage: `url(${preview})`,
            backgroundSize: backgroundSize
          }} />
      }
    </div>
  )  
}