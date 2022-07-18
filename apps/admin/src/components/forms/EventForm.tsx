import { useState } from 'react'
import Checkbox from '../elements/Checkbox'
import Input from '../elements/Input'
import Select from '../elements/Select'
import LocationSelect from '../elements/LocationSelect'
import ImageStack from '../elements/ImageStack'
import Event from '../elements/Event'
import IconImage from '../icons/IconImage'
import DateInput from '../elements/DateInput'
import { add, addYears } from 'date-fns'

export type EventFormProps = {
  current?: {
    image?: string
    videoUrl?: string
    title?: string
    shortDescription?: string
    longDescription?: string
    type?: string
    repeat?: string
    lat?: number
    lng?: number
    locationAddress?: string
    imageGallery?: any[]
    organizerName?: string
    organizerEmail?: string
    organizerTelephone?: string
    moreInfoUrl?: string
    showOnMap?: boolean
    members?: number
    startDate?: string
    endDate?: string
  }
}

const types = [
  {
    label: 'Class',
    value: 'class'
  },
  {
    label: 'Meetup',
    value: 'meetup'
  },
  {
    label: 'Group',
    value: 'group'
  },
  {
    label: 'Virtual',
    value: 'virtual'
  }
]

const repeats = [
  {
    label: 'Never',
    value: 'never'
  },
  {
    label: 'Weekly',
    value: 'weekly'
  },
  {
    label: 'Monthly',
    value: 'monthly'
  },
  {
    label: 'Annually',
    value: 'annually'
  },
  {
    label: 'Every Weekday',
    value: 'every weekday'
  },
  {
    label: 'Custom',
    value: 'custom'
  }
]

export default function EventForm({ current }: EventFormProps) {
  const [image, setImage] = useState(current?.image || '')
  const [videoUrl, setVideoUrl] = useState(current?.videoUrl || '')
  const [title, setTitle] = useState(current?.title || '')
  const [shortDescription, setShortDescription] = useState(
    current?.shortDescription || ''
  )
  const [longDescription, setLongDescription] = useState(
    current?.longDescription || ''
  )
  const [type, setType] = useState(current?.type || types[0].value)
  const [repeat, setRepeat] = useState(current?.repeat || repeats[0].value)
  const [lat, setLat] = useState(current?.lat || 37.734063)
  const [lng, setLng] = useState(current?.lng || -119.6418973)
  const [locationAddress, setLocationAddress] = useState(
    current?.locationAddress || ''
  )
  const [imageGallery, setImageGallery] = useState<any[]>(
    current?.imageGallery || []
  )
  const [organizerName, setOrganizerName] = useState(
    current?.organizerName || ''
  )
  const [organizerEmail, setOrganizerEmail] = useState(
    current?.organizerEmail || ''
  )
  const [organizerTelephone, setOrganizerTelephone] = useState(
    current?.organizerTelephone || ''
  )
  const [moreInfoUrl, setMoreInfoUrl] = useState(current?.moreInfoUrl || '')
  const [showOnMap, setShowOnMap] = useState(current?.showOnMap || true)
  const [startDate, setStartDate] = useState(
    current?.startDate ? new Date(current.startDate) : new Date()
  )
  const [endDate, setEndDate] = useState(
    current?.endDate ? new Date(current.endDate) : add(new Date(), { days: 1 })
  )

  const previewImage = (e) => {
    setImage(URL.createObjectURL(e.target.files[0]))
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <h4 className="light mb-3">{current ? 'Edit event' : 'New event'}</h4>

      <Event
        image={image}
        title={title}
        shortDescription={shortDescription}
        members={current?.members || 0}
        type={type}
        startDate={startDate}
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
        name="videoUrl"
        placeholder="YouTube or Vimeo URL"
        label="Video URL"
        value={videoUrl}
        onChange={(v) => setVideoUrl(v)}
      />

      <Input
        name="title"
        placeholder="Title"
        label="Title"
        value={title}
        onChange={(v) => setTitle(v)}
      />

      <Input
        name="shortDescription"
        placeholder="Short description"
        label="Short description"
        value={shortDescription}
        type="textarea"
        onChange={(v) => setShortDescription(v)}
      />

      <Input
        name="longDescription"
        placeholder="Long description"
        label="Long description"
        value={longDescription}
        type="textarea"
        onChange={(v) => setLongDescription(v)}
      />

      <Select
        id="type"
        defaultValue={types[types.findIndex((x) => x.value === type)]}
        isSearchable={false}
        options={types}
        label="Type"
        onChange={(v) => setType(v.value)}
      />

      <DateInput
        label="Start date and time"
        name="startDate"
        startDate={startDate}
        onChange={(v) => setStartDate(v)}
        minDate={new Date()}
        maxDate={addYears(new Date(), 10)}
      />

      <DateInput
        label="End date and time"
        name="endDate"
        startDate={endDate}
        onChange={(v) => setEndDate(v)}
        minDate={startDate ? new Date(startDate) : new Date()}
        maxDate={addYears(new Date(), 10)}
      />

      <Select
        id="repeat"
        defaultValue={repeats[repeats.findIndex((x) => x.value === repeat)]}
        isSearchable={false}
        options={repeats}
        label="Repeat"
        onChange={(v) => setRepeat(v.value)}
      />

      <LocationSelect
        lng={lng}
        lat={lat}
        label="Select location"
        onChange={(lng, lat) => {
          setLng(lng)
          setLat(lat)
        }}
      />

      <Input
        value={locationAddress}
        onChange={(v) => setLocationAddress(v)}
        name="locationAddress"
        placeholder="Location Address"
        label="Location Address"
      />

      <ImageStack label="Image Gallery" files={imageGallery} />

      <Input
        value={organizerName}
        onChange={(v) => setOrganizerName(v)}
        name="organizerName"
        placeholder="Organisers name"
        label="Organisers name"
      />

      <Input
        value={organizerEmail}
        onChange={(v) => setOrganizerEmail(v)}
        name="organizerEmail"
        placeholder="hello@organiser.com"
        label="Organisers email"
      />

      <Input
        value={organizerTelephone}
        onChange={(v) => setOrganizerTelephone(v)}
        name="organizerTelephone"
        placeholder="(000) 0000 0000"
        label="Organisers telephone number"
      />

      <Input
        value={moreInfoUrl}
        onChange={(v) => setMoreInfoUrl(v)}
        name="moreInfoUrl"
        placeholder="More Info URL"
        label="More Info URL"
      />

      <Checkbox
        label="Show on map"
        name="showOnMap"
        checked={showOnMap}
        showSwitch={true}
        onChange={(v) => setShowOnMap(v)}
      />

      <div className="text-right mt-2">
        <button className="button">
          {current ? 'Update' : 'Create event'}
        </button>
      </div>
    </form>
  )
}
