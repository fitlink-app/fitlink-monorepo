import { useState } from 'react'
import { add, addYears } from 'date-fns'
import parse from 'html-react-parser'
import Input from '../elements/Input'
import Reward, { RewardProps } from '../elements/Reward'
import DateInput from '../elements/DateInput'
import IconImage from '../icons/IconImage'
import Select from '../elements/Select'

export type CharityFormProps = {
  current?: RewardProps
}

export default function CharityForm({ current }: CharityFormProps) {
  const [purchased, setPurchased] = useState(current?.admin?.purchased || false)
  const [image, setImage] = useState(current?.image || '')
  const [brand, setBrand] = useState(current?.brand || '')
  const [shortTitle, setShortTitle] = useState(current?.shortTitle || '')
  const [title, setTitle] = useState(current?.title || '')
  const [points, setPoints] = useState(current?.points || 0)
  const [expires, setExpires] = useState(
    current?.expires
      ? new Date(current?.expires)
      : add(new Date(), { months: 2 })
  )
  const [code, setCode] = useState(current?.code || '')
  const [instructions, setInstructions] = useState(current?.instructions || '')
  const [url, setUrl] = useState(current?.url || '')
  const [description, setDescription] = useState(current?.description || '')

  // admin
  const [purchaseAmount, setPurchaseAmount] = useState(
    current.admin.options ? Number(current.admin.options[0].value) : 1
  )

  const previewImage = (e) => {
    setImage(URL.createObjectURL(e.target.files[0]))
  }

  const purchase = () => {
    setPurchased(true)
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      {!purchased ? (
        <>
          <h3 className="light">{current.admin.title}</h3>
          <h4 className="unbilled-amount light inline-block">
            {current.admin.currency.symbol}
            {current.admin.cost.toLocaleString(undefined, {
              minimumFractionDigits: 2
            })}
            &nbsp;<small>per reward</small>
          </h4>
          {parse(current.admin.description)}
          <hr />
          {!current.admin.options ? (
            <Input
              name="purchase_amount"
              placeholder="1"
              label="Enter amount to purchase"
              value={purchaseAmount}
              type="number"
              min={1}
              max={100000}
              onChange={(v) => setPurchaseAmount(v)}
            />
          ) : (
            <Select
              id="purchase_amount"
              defaultValue={current.admin.options[0]}
              isSearchable={false}
              options={current.admin.options}
              label="Select package to purchase"
              onChange={(v) => setPurchaseAmount(Number(v.value))}
            />
          )}
          <div className="flex ai-c jc-c my-2">
            <p className="my-0 mr-1">A total of</p>
            <span className="h1 light my-0 mr-1 block">
              {current.admin?.currency.symbol}
              {(purchaseAmount * current.admin.cost).toLocaleString(undefined, {
                minimumFractionDigits: 2
              })}
            </span>
            <p className="my-0">will be added to your next invoice</p>
          </div>
          <div className="text-right mt-2">
            <button className="button" onClick={purchase}>
              Purchase now
            </button>
          </div>
        </>
      ) : (
        <>
          <h4 className="light mb-3">Edit reward</h4>
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
              {current ? 'Update' : 'Create reward'}
            </button>
          </div>
        </>
      )}
    </form>
  )
}
