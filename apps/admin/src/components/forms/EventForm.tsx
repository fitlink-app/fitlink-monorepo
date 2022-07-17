import { useContext, useState } from 'react'
import Input from '../elements/Input'
import Checkbox from '../elements/Checkbox'
import Event from '../elements/Event'
import IconImage from '../icons/IconImage'
import Select from '../elements/Select'
import { add, addYears } from 'date-fns'
import DateInput from '../elements/DateInput'
import { AuthContext } from '../../context/Auth.context'
import { Controller, useForm } from 'react-hook-form'
import useFormMutations from '../../hooks/api/useFormMutations'
import noop from 'lodash/noop'
import Feedback from '../elements/Feedback'
import LocationSelect from '../elements/LocationSelect'
import ImageStack from '../elements/ImageStack'

export type EventFormProps = {
  current?: any
  onSave?: () => void
  onError?: (err: any) => void
  onDelete?: (fields: any) => void
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

const durations = [
  {
    label: '1 week',
    value: '7'
  },
  {
    label: '2 weeks',
    value: '14'
  },
  {
    label: '3 weeks',
    value: '21'
  },
  {
    label: '4 weeks',
    value: '28'
  }
]

const getFields = (event: any) => {
  return {
    id: event?.id,
    videoUrl: event?.videoUrl,
    title: event?.title,
    shortDescription: event?.shortDescription,
    longDescription: event?.longDescription,
    type: event?.type,
    startDate: event?.startDate,
    endDate: event?.endDate,
    repeat: event?.repeat || 'never',
    locationMap: event?.locationMap,
    locationAddress: event?.locationAddress,
    imageGallery: event?.imageGallery,
    organizerName: event?.organizerName,
    organizerEmail: event?.organizerEmail,
    organizerTelephone: event?.organizerTelephone,
    moreInfoUrl: event?.moreInfoUrl,
    showOnMap: event?.showOnMap || true,
    image_upload: undefined
  }
}

export default function EventForm({
  current,
  onSave = noop,
  onDelete = noop,
  onError = noop
}: EventFormProps) {
  const { api, modeRole, primary } = useContext(AuthContext)
  const [image, setImage] = useState(current?.image?.url || '')
  const [imageGallery, setImageGallery] = useState<any[]>(
    current?.imageGallery || []
  )
  const isUpdate = !!current?.id

  const { register, handleSubmit, watch, setValue, control } = useForm({
    defaultValues: getFields(current)
  })

  const { errors } = useFormMutations<any, any>({
    type: 'Event',
    isUpdate,
    create: (payload) =>
      api.post<any>(
        // @ts-expect-error
        '/events',
        {
          payload
        },
        {
          primary,
          useRole: modeRole
        }
      ),
    update: (payload) =>
      api.put<any>(
        // @ts-expect-error
        `/events/:eventId`,
        {
          payload,
          eventId: current?.id
        },
        {
          primary,
          useRole: modeRole
        }
      )
  })

  const title = watch('title')
  const shortDescription = watch('shortDescription')
  const type = watch('type')
  const startDate = watch('startDate')
  const endDate = watch('endDate')
  const repeat = watch('repeat')
  const locationMap = watch('locationMap')
  const showOnMap = watch('showOnMap')

  async function onSubmit() {}

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h4 className="light mb-3">{current?.id ? 'Edit event' : 'New event'}</h4>

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
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setImage(URL.createObjectURL(event.target.files[0]))
            setValue('image_upload', event.target.files[0])
          }}
          accept="image/*"
        />
        <IconImage />
        <label htmlFor="image">Select an image</label>
      </div>

      <div>
        {errors.imageId && (
          <Feedback type="error" message="An image must be provided" />
        )}
      </div>

      <Input
        name="videoUrl"
        placeholder="YouTube or Vimeo URL"
        label="Video URL"
        register={register('videoUrl')}
        error={errors.videoUrl}
      />

      <Input
        name="title"
        placeholder="Title"
        label="Title"
        register={register('title')}
        error={errors.title}
      />

      <Input
        name="shortDescription"
        placeholder="Short description"
        label="Short description"
        type="textarea"
        register={register('shortDescription')}
        error={errors.shortDescription}
      />

      <Input
        name="longDescription"
        placeholder="Long description"
        label="Long description"
        type="textarea"
        register={register('longDescription')}
        error={errors.longDescription}
      />

      <Select
        id="type"
        defaultValue={types[types.findIndex((x) => x.value === type)]}
        isSearchable={false}
        options={types}
        label="Type"
        onChange={(item) => {
          setValue('type', item.value)
        }}
        error={errors.type}
      />

      <DateInput
        label="Start date and time"
        name="startDate"
        startDate={startDate ? new Date(startDate) : new Date()}
        onChange={(v) => {
          setValue('startDate', v)
        }}
        minDate={new Date()}
        maxDate={addYears(new Date(), 10)}
        error={errors.startDate}
      />

      <DateInput
        label="End date and time"
        name="endDate"
        startDate={endDate ? new Date(endDate) : new Date()}
        onChange={(v) => {
          setValue('endDate', v)
        }}
        minDate={startDate ? new Date(startDate) : new Date()}
        maxDate={addYears(new Date(), 10)}
        error={errors.endDate}
      />

      <Select
        id="repeat"
        defaultValue={repeats[repeats.findIndex((x) => x.value === repeat)]}
        isSearchable={false}
        options={repeats}
        label="Repeat"
        onChange={(item) => {
          setValue('repeat', item.value)
        }}
        error={errors.type}
      />

      <Controller
        name="locationMap"
        control={control}
        render={({ field }) => {
          const coord = locationMap || '51.509865,-0.118092'
          const [lat, lng] = coord.split(',').map((e) => parseFloat(e))

          return (
            <LocationSelect
              lng={lng}
              lat={lat}
              label="Select location"
              onChange={(lng, lat) => {
                field.onChange([lat, lng].join(','))
              }}
            />
          )
        }}
      />

      <Input
        register={register('locationAddress')}
        name="locationAddress"
        placeholder="Location Address"
        label="Location Address"
        error={errors.locationAddress}
      />

      <ImageStack
        label="Image Gallery"
        files={imageGallery}
        onChange={setImageGallery}
      />

      <Input
        register={register('organizerName')}
        name="organizerName"
        placeholder="Organisers name"
        label="Organisers name"
        error={errors.organizerName}
      />

      <Input
        register={register('organizerEmail')}
        name="organizerEmail"
        placeholder="hello@organiser.com"
        label="Organisers email"
        error={errors.organizerEmail}
      />

      <Input
        register={register('organizerTelephone')}
        name="organizerTelephone"
        placeholder="(000) 0000 0000"
        label="Organisers telephone number"
        error={errors.organizerTelephone}
      />

      <Input
        register={register('moreInfoUrl')}
        name="moreInfoUrl"
        placeholder="More Info URL"
        label="More Info URL"
        error={errors.moreInfoUrl}
      />

      <Checkbox
        label="Show on map"
        name="showOnMap"
        checked={showOnMap}
        showSwitch={true}
        register={register('showOnMap')}
      />

      <div className="text-right mt-2">
        {current?.id && (
          <button
            className="button alt mr-2"
            type="button"
            onClick={() => {
              onDelete(current)
            }}>
            Delete
          </button>
        )}

        <button className="button" type="submit">
          {current ? 'Update' : 'Create event'}
        </button>
      </div>
    </form>
  )
}
