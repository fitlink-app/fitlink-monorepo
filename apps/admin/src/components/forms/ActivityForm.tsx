import { useState } from 'react'
import Currency from '../elements/Currency'
import Input from '../elements/Input'
import Select from '../elements/Select'
import LocationSelect from '../elements/LocationSelect'

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
    meeting_point_text: string
    lat: string
    lng: string
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
  const [lat, setLat] = useState(current?.lat || '')
  const [lng, setLng] = useState(current?.lng || '')
  const [organizer_name, setOrganizer_name] = useState(current?.organizer_name || '')
  const [organizer_url, setOrganizer_url] = useState(current?.organizer_url || '')
  const [organizer_telephone, setOrganizer_telephone] = useState(current?.organizer_telephone || '')
  const [organizer_email, setOrganizer_email] = useState(current?.organizer_email || '')

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
        label="Select location"
        onChange={(lng, lat) => {
          setLng(lng)
          setLat(lat)
        }}
      />
      <div className="text-right mt-2">
        <button className="button">
          { current ? 'Edit activity' : 'Create activity' }
        </button>
      </div>
    </form>
  )
}
