import { useState } from 'react'

export type AvatarSelectProps = {
  src?: string
  label?: string
  onChange?: (file: File | null) => void
}

export default function AvatarSelect({
  src,
  onChange,
  label = 'Select an image'
}: AvatarSelectProps) {
  const id = `image_${Math.random().toString(36).substring(7)}`

  const [image, setImage] = useState(src || '')

  const previewImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImage(URL.createObjectURL(e.target.files[0]))
    if (onChange) onChange(e.target.files[0])
  }

  const reset = (e) => {
    ;(document.getElementById(id) as HTMLInputElement).value = null
    setImage('')
    onChange(null)
  }

  return (
    <div className="avatar-select">
      <div
        className="avatar-select__preview"
        style={{ backgroundImage: `url(${image})` }}
      />
      <input type="file" id={id} onChange={previewImage} accept="image/*" />
      <label htmlFor={id} className="pointer">
        {label}
      </label>
      {image !== '' && (
        <small className="block ml-a mr-0" onClick={reset}>
          remove image
        </small>
      )}
    </div>
  )
}
