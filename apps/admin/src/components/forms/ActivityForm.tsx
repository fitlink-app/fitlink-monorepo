import { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Currency from '../elements/Currency'
import Checkbox from '../elements/Checkbox'
import Input from '../elements/Input'
import Select from '../elements/Select'
import LocationSelect from '../elements/LocationSelect'
import AvatarSelect from '../elements/AvatarSelect'
import ImageStack from '../elements/ImageStack'
import { Activity } from '@fitlink/api/src/modules/activities/entities/activity.entity'
import { Controller, useForm } from 'react-hook-form'
import { CreateActivityDto } from '@fitlink/api/src/modules/activities/dto/create-activity.dto'
import { useMutation } from 'react-query'
import { ApiMutationResult } from '@fitlink/common/react-query/types'
import { Image } from '@fitlink/api/src/modules/images/entities/image.entity'
import { AuthContext, FocusRole, RolePrimary } from '../../context/Auth.context'
import { UpdateResult } from '@fitlink/api-sdk/types'
import { UpdateActivityDto } from '@fitlink/api/src/modules/activities/dto/update-activity.dto'
import useApiErrors from '../../hooks/useApiErrors'

export type ImageProps = {
  url: string
  width: number
  height: number
  id?: string
  file?: File
}

export type ActivityFormProps = {
  current?: Partial<Activity>
  onSave?: () => void
  onError?: (err: any) => void
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
      : '37.734063,-119.6418973',
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
  const { api, focusRole, primary, endpointPrefix } = useContext(AuthContext)
  const [showOrg, setShowOrg] = useState(current?.organizer_name ? true : false)
  const [images, setImages] = useState<ImageProps[]>(current.images || [])
  const isUpdate = current.id

  const { register, handleSubmit, control, watch, setValue } = useForm({
    defaultValues: getFields(current)
  })

  const meetingPoint: string = watch('meeting_point')

  const upload: ApiMutationResult<Image> = useMutation((file: File) => {
    const payload = new FormData()
    payload.append('image', file)
    return api.uploadFile<Image>('/images', { payload })
  })

  const create: ApiMutationResult<Activity> = useMutation(
    (payload: CreateActivityDto) =>
      api.post<Activity>(`${endpointPrefix}/activities`, {
        payload,
        organisationId: primary.organisation,
        teamId: primary.team
      })
  )

  const update: ApiMutationResult<UpdateResult> = useMutation(
    (payload: UpdateActivityDto) =>
      api.put<Activity>(`${endpointPrefix}/activities/:activityId`, {
        payload,
        activityId: current.id,
        organisationId: primary.organisation,
        teamId: primary.team
      })
  )

  const { errors, isError, errorMessage, clearErrors } = useApiErrors(
    create.isError || update.isError,
    {
      ...create.error,
      ...update.error
    }
  )

  async function onSubmit(
    data: CreateActivityDto & {
      organizer_image_upload: File
    }
  ) {
    const { organizer_image_upload, ...rest } = data
    const payload: CreateActivityDto = rest

    console.log(data)

    try {
      // Wait for image upload
      if (organizer_image_upload instanceof File) {
        const { id } = await upload.mutateAsync(organizer_image_upload)
        payload.organizer_image = id
      }

      // Explicitly delete
      if (organizer_image_upload === null) {
        payload.organizer_image = null
      }

      let allImages: string[] = images.filter((e) => e.id).map((e) => e.id)

      // Upload new images
      if (images.length) {
        const imagesToUpload = images.filter((each) => each.file)
        const promise = Promise.all(
          imagesToUpload.map((each) => {
            return upload.mutateAsync(each.file)
          })
        )

        if (imagesToUpload.length) {
          const results = await toast.promise(promise, {
            loading: <b>Uploading images...</b>,
            success: <b>Added images</b>,
            error: <b>Error uploading images</b>
          })
          allImages = allImages.concat(results.map((e) => e.id))
        }
      }

      payload.images = allImages.join(',')

      // Delete organizer info if required
      if (!showOrg) {
        payload.organizer_email = null
        payload.organizer_image = null
        payload.organizer_name = null
        payload.organizer_url = null
        payload.organizer_telephone = null
      }

      if (isUpdate) {
        await toast.promise(update.mutateAsync(payload), {
          loading: <b>Saving...</b>,
          success: <b>Activity updated</b>,
          error: <b>Error</b>
        })
      } else {
        await toast.promise(create.mutateAsync(payload), {
          loading: <b>Saving...</b>,
          success: <b>Activity created</b>,
          error: <b>Error</b>
        })
      }

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
            onChange={(result, file) => {
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
        <button className="button">
          {current ? 'Save Activity' : 'Create Activity'}
        </button>
      </div>
    </form>
  )
}
