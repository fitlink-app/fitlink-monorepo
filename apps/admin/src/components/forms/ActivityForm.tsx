import { useState } from 'react'
import Currency from '../elements/Currency'
import Checkbox from '../elements/Checkbox'
import Input from '../elements/Input'
import Select from '../elements/Select'
import LocationSelect from '../elements/LocationSelect'
import AvatarSelect from '../elements/AvatarSelect'

export type InviteUserProps = {
  current?: {
    name: string
    description: string
    date: string
    cost: number
    organizer_name: string
    organizer_url: string
    organizer_telephone: string
    organizer_email: string
    organizer_image: string
    meeting_point_text: string
    lat: number
    lng: number
    type: {
      value: string
      label: string
    }
  }
}

const types = [
  {
    label: 'Class',
    value: 'class'
  },
  {
    label: 'Route',
    value: 'route'
  },
  {
    label: 'Group',
    value: 'group'
  }
]

export default function ActivityForm({
  current
}:InviteUserProps) {

  const [name, setName] = useState(current?.name || '')
  const [description, setDescription] = useState(current?.description || '')
  const [type, setType] = useState(current?.type || types[0])
  const [date, setDate] = useState(current?.date || '')
  const [cost, setCost] = useState(current?.cost || 0.00)
  const [meeting_point_text, setMeeting_point_text] = useState(current?.meeting_point_text || '')
  const [lat, setLat] = useState(current?.lat || 37.734063)
  const [lng, setLng] = useState(current?.lng || -119.6418973)
  const [showOrg, setShowOrg] = useState(current?.organizer_name ? true : false)
  const [organizer_name, setOrganizer_name] = useState(current?.organizer_name || '')
  const [organizer_url, setOrganizer_url] = useState(current?.organizer_url || '')
  const [organizer_telephone, setOrganizer_telephone] = useState(current?.organizer_telephone || '')
  const [organizer_email, setOrganizer_email] = useState(current?.organizer_email || '')
  const [organizer_image, setOrganizer_image] = useState(current?.organizer_email || '')

  return (
    <form onSubmit={ (e) => e.preventDefault() }>
      <h4 className="light mb-3">
        { current ? 'Edit activity details' : 'Create new activity' }
      </h4>
      <Input
        name="name"
        placeholder="Activity name"
        label="Activity name"
        value={name}
        onChange={(v) => setName(v)}
      />
      <Input
        name="description"
        placeholder="Description"
        label="Long description"
        value={description}
        type="textarea"
        onChange={(v) => setDescription(v)}
      />
      <Select
        id="type"
        defaultValue={type}
        isSearchable={false}
        options={types}
        label="Activity type"
        onChange={(v) => setType(v)}
      />
      <Input
        name="date"
        placeholder="Every day"
        label="When does this activity take place?"
        value={date}
        onChange={(v) => setDate(v)}
      />
      <Currency
        name="cost"
        placeholder="0.00"
        label="Cost"
        value={cost}
        onChange={(v) => setCost(v)}
      />
      <Input
        name="meeting_point_text"
        placeholder="Meeting point"
        label="Meeting point"
        value={meeting_point_text}
        type="textarea"
        onChange={(v) => setMeeting_point_text(v)}
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
      <Checkbox
        label="Show organisers details"
        name="showorg"
        checked={showOrg}
        showSwitch={true}
        onChange={(v) => setShowOrg(v)}
      />

      { showOrg &&
        <>
          <Input
            name="organizer_name"
            placeholder="Organisers name"
            label="Organisers name"
            value={organizer_name}
            onChange={(v) => setOrganizer_name(v)}
          />
          <Input
            name="organizer_url"
            placeholder="https://"
            label="Organisers URL"
            value={organizer_url}
            onChange={(v) => setOrganizer_url(v)}
          />
          <Input
            name="organizer_telephone"
            placeholder="(000) 0000 0000"
            label="Organisers telephone number"
            value={organizer_telephone}
            onChange={(v) => setOrganizer_telephone(v)}
          />
          <Input
            name="organizer_email"
            placeholder="hello@organiser.com"
            label="Organisers email"
            value={organizer_email}
            onChange={(v) => setOrganizer_email(v)}
          />
          <AvatarSelect
            src={organizer_image}
            onChange={(v) => setOrganizer_image(v)}
            />
        </>
      }

      <div className="text-right mt-2">
        <button className="button">
          { current ? 'Edit activity' : 'Create activity' }
        </button>
      </div>
    </form>
  )
}
