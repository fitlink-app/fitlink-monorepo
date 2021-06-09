import { useState } from 'react'
import { format, add } from 'date-fns'
import Input from '../elements/Input'
import Reward from '../elements/Reward'

export default function NewReward() {
  const [image, setImage] = useState('')
  const [brand, setBrand] = useState('')
  const [shortTitle, setShortTitle] = useState('')
  const [title, setTitle] = useState('')
  const [points, setPoints] = useState(0)
  const [expires, setExpires] = useState(format(add(new Date(), {months: 6}), 'yyyy-MM-dd'))
  const [code, setCode] = useState('')
  const [instructions, setInstructions] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  
  return (
    <>
      <h4 className="light mb-3">New reward</h4>
      <p>Preview</p>
      <Reward
        image={image}
        brand={brand}
        shortTitle={shortTitle}
        points={points}
        expires={expires}
        redeemed={0}
        />

      <Input
        name="points"
        placeholder="0"
        label="Points required"
        value={points}
        type="number"
        onChange={ (v) => setPoints(v) }
        />
      <Input
        name="brand"
        placeholder="Brand name"
        label="Brand name"
        value={brand}
        onChange={ (v) => setBrand(v) }
        />
      <Input
        name="shortTitle"
        placeholder="Short title"
        label="Title (on thumbnail)"
        value={shortTitle}
        onChange={ (v) => setShortTitle(v) }
        />
      <Input
        name="title"
        placeholder="Full title"
        label="Full title (in details page)"
        value={title}
        onChange={ (v) => setTitle(v) }
        />
      <Input
        name="description"
        placeholder="Description"
        label="Long description"
        value={description}
        type="textarea"
        onChange={ (v) => setDescription(v) }
        />
      <Input
        name="code"
        placeholder="Code"
        label="Redemption code"
        value={code}
        onChange={ (v) => setCode(v) }
        />
      <Input
        name="instructions"
        placeholder="How to redeem"
        label="Redemption instructions"
        value={instructions}
        type="textarea"
        rows={3}
        onChange={ (v) => setInstructions(v) }
        />
        <Input
        name="url"
        placeholder="URL"
        label="Redemption URL"
        value={url}
        onChange={ (v) => setUrl(v) }
        />
    </>
  )
}