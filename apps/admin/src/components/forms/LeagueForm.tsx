import { useState } from 'react'
import Input from '../elements/Input'
import Checkbox from '../elements/Checkbox'
import League from '../elements/League'
import IconImage from '../icons/IconImage'
import Select from '../elements/Select'
import { add, addYears } from 'date-fns'
import DateInput from '../elements/DateInput'

export type LeagueFormProps = {
  current?: {
    image?: string
    name?: string
    description?: string
    members?: number
    duration?: number
    sport?: string
    repeats?: boolean
    startDate?: string | Date
    resetDate?: string
    created?: string
  }
}

const sports = [
  {
    label: 'Run',
    value: 'run'
  },
  {
    label: 'Ride',
    value: 'ride'
  },
  {
    label: 'Swim',
    value: 'swim'
  },
  {
    label: 'Walk',
    value: 'walk'
  },
  {
    label: 'Steps',
    value: 'steps'
  },
  {
    label: 'Crossfit',
    value: 'crossfit'
  },
  {
    label: 'HIIT',
    value: 'hiit'
  },
  {
    label: 'Skiing',
    value: 'skiing'
  },
  {
    label: 'Hiking',
    value: 'hiking'
  },
  {
    label: 'Snowboarding',
    value: 'snowboarding'
  },
  {
    label: 'Rowing',
    value: 'rowing'
  },
  {
    label: 'Surfing',
    value: 'surfing'
  },
  {
    label: 'Yoga',
    value: 'yoga'
  }
]

const durations = [
  {
    label: '1 week',
    value: 7
  },
  {
    label: '2 weeks',
    value: 14
  },
  {
    label: '3 weeks',
    value: 21
  },
  {
    label: '4 weeks',
    value: 28
  }
]

export default function LeagueForm({
  current
}:LeagueFormProps) {
  const [image, setImage] = useState(current?.image || '')
  const [name, setName] = useState(current?.name || '')
  const [description, setDescription] = useState(current?.description || '')
  const [startDate, setStartDate] = useState(current?.startDate ? new Date(current?.startDate) : add(new Date(), { months: 2 }))
  const [duration, setDuration] = useState(current?.duration || 7)
  const [sport, setSport] = useState(current?.sport || 'steps')
  const [repeats, setRepeats] = useState(current?.repeats || true)

  const previewImage = (e) => {
    setImage(URL.createObjectURL(e.target.files[0]))
  }

  return (
    <form onSubmit={ (e) => e.preventDefault() }>
      <h4 className="light mb-3">
        { current ? 'Edit league' : 'New league' }
      </h4>
      <League
        image={image}
        name={name}
        description={description}
        members={current?.members || 0}
        resetDate={current?.resetDate || add(new Date(), { days: duration })}
        sport={sport}
        repeats={repeats}
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
        name="name"
        placeholder="League name"
        label="League name"
        value={name}
        onChange={(v) => setName(v)}
      />
      <Input
        name="description"
        placeholder="Description"
        label="Description"
        value={description}
        type="textarea"
        onChange={(v) => setDescription(v)}
      />
      <DateInput
        label="Start date"
        name="startDate"
        startDate={startDate}
        onChange={(v) => setStartDate(v)}
        minDate={new Date()}
        maxDate={addYears(new Date(), 10)}
      />
      <Select
        id="duration"
        defaultValue={durations[durations.findIndex(x => x.value === duration)]}
        isSearchable={false}
        options={durations}
        label="Duration"
        onChange={(v) => setDuration(v.value)}
      />
      <Select
        id="sport"
        defaultValue={sports[sports.findIndex(x => x.value === sport)]}
        isSearchable={false}
        options={sports}
        label="Sport"
        onChange={(v) => setSport(v.value)}
      />
      <Checkbox
        label="This activity repeats"
        name="repeats"
        checked={repeats}
        showSwitch={true}
        onChange={(v) => setRepeats(v)}
        />
      <div className="text-right mt-2">
        <button className="button">
        { current ? 'Update' : 'Create league' }
        </button>
      </div>
    </form>
  )
}
