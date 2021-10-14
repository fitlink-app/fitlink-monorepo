import { useContext, useState } from 'react'
import Checkbox from '../elements/Checkbox'
import Input from '../elements/Input'
import Select from '../elements/Select'
import LocationSelect from '../elements/LocationSelect'
import AvatarSelect from '../elements/AvatarSelect'
import ImageStack, { ImageFile } from '../elements/ImageStack'
import { Activity } from '@fitlink/api/src/modules/activities/entities/activity.entity'
import { Controller, useForm } from 'react-hook-form'
import { CreateActivityDto } from '@fitlink/api/src/modules/activities/dto/create-activity.dto'
import { AuthContext } from '../../context/Auth.context'
import useFormMutations from '../../hooks/api/useFormMutations'
import { ActivityType } from '@fitlink/api/src/modules/activities/activities.constants'
import { ListResource, ReadResource } from '../../../../api-sdk/types'

export type ActivityFormProps = {
  current?: Partial<Activity>
  onSave?: () => void
  onError?: (err: any) => void
}

const types = Object.keys(ActivityType).map((label) => {
  return {
    label,
    value: ActivityType[label]
  }
})

const noop = () => {}

const getFields = (activity: Partial<Activity>) => {
  return {
    id: activity.id,
    name: activity.name,
    description: activity.description,
    date: activity.date,
    cost: activity.cost,
    organizer_name: activity.organizer_name,
    organizer_url: activity.organizer_url,
    organizer_telephone: activity.organizer_telephone,
    organizer_email: activity.organizer_email,
    organizer_image: activity.organizer_image
      ? activity.organizer_image.id
      : undefined,
    organizer_image_upload: undefined,
    meeting_point_text: activity.meeting_point_text,
    meeting_point: activity.meeting_point
      ? activity.meeting_point.coordinates.join(',')
      : '51.476688,0.000130',
    lat: 0,
    lng: 0,
    type: activity.type
  }
}

export default function ActivityForm({
  current,
  onSave = noop,
  onError = noop
}: ActivityFormProps) {
  const { api, primary, modeRole } = useContext(AuthContext)
  const [showOrg, setShowOrg] = useState(current?.organizer_name ? true : false)
  const [images, setImages] = useState<ImageFile[]>(current.images || [])
  const isUpdate = !!current.id

  const {
    errors,
    createOrUpdate,
    uploadAndMerge,
    uploadReplaceOrKeep
  } = useFormMutations<CreateActivityDto, Activity>({
    type: 'Activity',
    isUpdate,
    create: (payload) =>
      api.post<Activity>(
        `/activities` as ListResource,
        {
          payload,
          organisationId: primary.organisation,
          teamId: primary.team
        },
        {
          primary,
          useRole: modeRole
        }
      ),
    update: (payload) =>
      api.put<Activity>(
        `/activities/:activityId` as ReadResource,
        {
          payload,
          activityId: current.id,
          organisationId: primary.organisation,
          teamId: primary.team
        },
        {
          primary,
          useRole: modeRole
        }
      )
  })

  const { register, handleSubmit, control, watch, setValue } = useForm({
    defaultValues: getFields(current)
  })

  const meetingPoint: string = watch('meeting_point')

  async function onSubmit(
    data: CreateActivityDto & {
      organizer_image_upload: File
    }
  ) {
    const { organizer_image_upload, ...payload } = data

    try {
      // Handle images upload
      payload.organizer_image = await uploadReplaceOrKeep(
        organizer_image_upload,
        data.organizer_image
      )
      payload.images = await uploadAndMerge(images)

      // Delete organizer info if required
      if (!showOrg) {
        payload.organizer_email = null
        payload.organizer_image = null
        payload.organizer_name = null
        payload.organizer_url = null
        payload.organizer_telephone = null
      }

      await createOrUpdate(payload)

      onSave()
    } catch (e) {
      onError(e)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h4 className="light mb-3">
        {current ? 'Edit activity details' : 'Create new activity'}
      </h4>

      <Input
        register={register('name')}
        name="name"
        placeholder="Activity name"
        label="Activity name"
        error={errors.name}
      />

      <Input
        register={register('description')}
        name="description"
        placeholder="Description"
        label="Long description"
        type="textarea"
        error={errors.description}
      />

      <Controller
        name="type"
        control={control}
        render={({ field }) => {
          return (
            <Select
              id="type"
              defaultValue={types.filter((e) => e.value === current.type)[0]}
              isSearchable={false}
              options={types}
              label="Activity type"
              onChange={(option) => {
                if (option) {
                  field.onChange(option.value)
                }
              }}
              onBlur={field.onBlur}
            />
          )
        }}
      />

      <Input
        register={register('date')}
        name="date"
        placeholder="Every day"
        label="When does this activity take place?"
        error={errors.date}
      />

      <Input
        register={register('cost')}
        name="cost"
        placeholder="£0.00"
        label="Cost"
        error={errors.cost}
      />

      <Input
        register={register('meeting_point_text')}
        name="meeting_point_text"
        placeholder="Meeting point"
        label="Meeting point"
        error={errors.meeting_point_text}
      />

      <ImageStack label="Images" files={images} onChange={setImages} />

      <Controller
        name="meeting_point"
        control={control}
        render={({ field }) => {
          const [lat, lng] = meetingPoint.split(',').map((e) => parseFloat(e))
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

      <Checkbox
        label="Show organisers details"
        name="showorg"
        checked={showOrg}
        showSwitch={true}
        onChange={(v) => setShowOrg(v)}
      />

      {showOrg && (
        <>
          <Input
            register={register('organizer_name')}
            name="organizer_name"
            placeholder="Organisers name"
            label="Organisers name"
            error={errors.organizer_name}
          />
          <Input
            register={register('organizer_url')}
            name="organizer_url"
            placeholder="https://"
            label="Organisers URL"
            error={errors.organizer_url}
          />
          <Input
            register={register('organizer_telephone')}
            name="organizer_telephone"
            placeholder="(000) 0000 0000"
            label="Organisers telephone number"
            error={errors.organizer_telephone}
          />
          <Input
            register={register('organizer_email')}
            name="organizer_email"
            placeholder="hello@organiser.com"
            label="Organisers email"
            error={errors.organizer_email}
          />

          <AvatarSelect
            label="Organisers image"
            src={
              current.organizer_image ? current.organizer_image.url : undefined
            }
            onChange={(_result, file) => {
              if (current.organizer_image && !file) {
                setValue('organizer_image', null)
                setValue('organizer_image_upload', null)
              } else {
                setValue('organizer_image_upload', file)
              }
            }}
          />
        </>
      )}

      <div className="text-right mt-2">
        <button className="button" type="submit">
          {current ? 'Save Activity' : 'Create Activity'}
        </button>
      </div>
    </form>
  )
}
