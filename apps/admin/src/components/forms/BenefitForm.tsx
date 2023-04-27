import { useState } from 'react'
import Input from '../elements/Input'
import Benefit, { BenefitProps } from '../elements/Benefit'
import IconImage from '../icons/IconImage'

export type BenefitFormProps = {
  current?: BenefitProps
}

export default function BenefitForm({ current }: BenefitFormProps) {
  const [image, setImage] = useState(current?.image || '')
  const [brand, setBrand] = useState(current?.brand || '')
  const [shortTitle, setShortTitle] = useState(current?.shortTitle || '')
  const [title, setTitle] = useState(current?.title || '')
  const [url, setUrl] = useState(current?.url || '')
  const [description, setDescription] = useState(current?.description || '')

  const previewImage = (e) => {
    setImage(URL.createObjectURL(e.target.files[0]))
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <h4 className="light mb-3">{current ? 'Edit benefit' : 'New benefit'}</h4>
      <Benefit
        image={image}
        brand={brand}
        shortTitle={shortTitle}
        title={title}
        url={url}
        description={description}
        showExtra={true}
      />

      <div className="basic-file-select">
        <input
          type="file"
          id="image"
          onChange={previewImage}
          accept="image/*"
        />
        <IconImage />
        <label htmlFor="image">Select an image</label>
      </div>

      <Input
        name="brand"
        placeholder="Brand name"
        label="Brand name"
        value={brand}
        onChange={(v) => setBrand(v)}
      />

      <Input
        name="shortTitle"
        placeholder="Short title"
        label="Title (on thumbnail)"
        value={shortTitle}
        onChange={(v) => setShortTitle(v)}
      />

      <Input
        name="title"
        placeholder="Full title"
        label="Full title (in details page)"
        value={title}
        onChange={(v) => setTitle(v)}
      />

      <Input
        name="description"
        placeholder="Description"
        label="Long description"
        value={description}
        type="textarea"
        onChange={(v) => setDescription(v)}
      />

      <Input
        name="url"
        placeholder="URL"
        label="More info URL"
        value={url}
        onChange={(v) => setUrl(v)}
      />

      <div className="text-right mt-2">
        <button className="button">
          {current ? 'Update' : 'Create benefit'}
        </button>
      </div>
    </form>
  )
}
