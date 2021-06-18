import { useState } from 'react'
import { add } from 'date-fns'
import Input from '../elements/Input'
import Reward from '../elements/Reward'
import DateInput from '../elements/DateInput'
import { addYears } from 'date-fns'
import IconImage from '../icons/IconImage'

export type RewardFormProps = {
  current?: {
    image?: string
    brand?: string
    shortTitle?: string
    title?: string
    points?: number
    expires?: string | Date
    code?: string
    instructions?: string
    url?: string
    description?: string
  }
}

export default function RewardForm({
  current
}:RewardFormProps) {
  const [image, setImage] = useState(current?.image || '')
  const [brand, setBrand] = useState(current?.brand || '')
  const [shortTitle, setShortTitle] = useState(current?.shortTitle || '')
  const [title, setTitle] = useState(current?.title || '')
  const [points, setPoints] = useState(current?.points || 0)
  const [expires, setExpires] = useState(current?.expires ? new Date(current?.expires) : add(new Date(), { months: 2 }))
  const [code, setCode] = useState(current?.code || '')
  const [instructions, setInstructions] = useState(current?.instructions || '')
  const [url, setUrl] = useState(current?.url || '')
  const [description, setDescription] = useState(current?.description || '')

  const previewImage = (e) => {
    setImage(URL.createObjectURL(e.target.files[0]))
  }

  return (
    <form onSubmit={ (e) => e.preventDefault() }>
      <h4 className="light mb-3">
        { current ? 'Edit reward' : 'New reward' }
      </h4>
      <Reward
        image={image}
        brand={brand}
        shortTitle={shortTitle}
        points={points}
        expires={expires}
        redeemed={0}
        title={title}
        description={description}
        code={code}
        instructions={instructions}
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
        name="points"
        placeholder="0"
        label="Points required"
        value={points}
        type="number"
        onChange={(v) => setPoints(v)}
      />
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
        name="code"
        placeholder="Code"
        label="Redemption code"
        value={code}
        onChange={(v) => setCode(v)}
      />
      <Input
        name="instructions"
        placeholder="How to redeem"
        label="Redemption instructions"
        value={instructions}
        type="textarea"
        rows={3}
        onChange={(v) => setInstructions(v)}
      />
      <Input
        name="url"
        placeholder="URL"
        label="Redemption URL"
        value={url}
        onChange={(v) => setUrl(v)}
      />
      <DateInput
        label="Expiry date"
        name="expires"
        startDate={expires}
        onChange={(v) => setExpires(v)}
        minDate={new Date()}
        maxDate={addYears(new Date(), 10)}
      />
      <div className="text-right mt-2">
        <button className="button">
        { current ? 'Update' : 'Create reward' }
        </button>
      </div>
    </form>
  )
}
