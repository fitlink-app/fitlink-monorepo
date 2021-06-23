import { useState } from 'react'

export type AvatarSelectProps = {
  src?: string
  onChange?: (file) => void
}

export default function AvatarSelect({
  src,
  onChange
}:AvatarSelectProps) {
  const [image, setImage] = useState(src || '')

  const previewImage = (e) => {
    setImage(URL.createObjectURL(e.target.files[0]))
    if (onChange) onChange(e.target.files[0])
  }

  return (
    <div className="avatar-select">
      <div
        className="avatar-select__preview"
        style={{backgroundImage: `url(${image})`}}
        />
      <input
        type="file"
        id="image"
        onChange={previewImage}
        accept="image/*"
      />
      <label htmlFor="image">Select an image</label>
    </div>
  )
}