import { useEffect, useState } from 'react'
import IconImage from '../icons/IconImage'

export type ImageSelectProps = {
  filename?: string
  removeable?: boolean
  accept?: string
  onChange?: (e: any) => void
  showPreview?: boolean
  label?: string
  backgroundSize?: string
}

export default function ImageSelect({
  filename,
  removeable = false,
  accept = 'image/*',
  onChange,
  showPreview = true,
  label = 'Select an image',
  backgroundSize = 'cover'
}:ImageSelectProps) {

  const [preview, setPreview] = useState(filename || '')

  const previewImage = (e) => {
    if (onChange) {
      onChange(e)
    }
    setPreview(URL.createObjectURL(e.target.files[0]))
  }

  return(
    <div className="image-select">
      <input
        type="file"
        id="image"
        onChange={previewImage}
        accept="image/*"
        />
      <IconImage />
      <label htmlFor="image">Select an image</label>
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