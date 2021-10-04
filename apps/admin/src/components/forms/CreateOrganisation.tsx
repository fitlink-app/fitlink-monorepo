import { useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Input from '../elements/Input'
import Select from '../elements/Select'
import { Controller, useForm } from 'react-hook-form'
import { CreateOrganisationDto } from '@fitlink/api/src/modules/organisations/dto/create-organisation.dto'
import { Organisation } from '@fitlink/api/src/modules/organisations/entities/organisation.entity'
import {
  OrganisationMode,
  OrganisationType
} from '@fitlink/api/src/modules/organisations/organisations.constants'
import Checkbox from '../elements/Checkbox'
import { AuthContext } from '../../context/Auth.context'
import { useMutation } from 'react-query'
import { ApiMutationResult } from '@fitlink/common/react-query/types'
import { UpdateResult } from '@fitlink/api-sdk/types'
import { getErrorMessage, stripBlankFields } from '../../../../api-sdk'
import Feedback from '../elements/Feedback'
import useApiErrors from '../../hooks/useApiErrors'
import AvatarSelect from '../elements/AvatarSelect'
import { Image } from '../../../../api/src/modules/images/entities/image.entity'
import noop from 'lodash/noop'

export type CreateOrganisationProps = {
  current?: Partial<Organisation>
  onSave?: () => void
  onError?: () => void
}

const organisationTypes = Object.keys(OrganisationType).map((key) => {
  return {
    label: key,
    value: OrganisationType[key]
  }
})

const organisationModes = Object.keys(OrganisationMode).map((key) => {
  return {
    label: key,
    value: OrganisationMode[key]
  }
})

export default function CreateOrganisation({
  current = {},
  onSave = noop,
  onError = noop
}: CreateOrganisationProps) {
  const isUpdate = current && current.id
  const { api } = useContext(AuthContext)
  const { register, handleSubmit, control, watch, setValue } = useForm({
    defaultValues: current
      ? {
          name: current.name,
          timezone: current.timezone,
          type: current.type,
          type_other: current.type_other,
          invite_user: false,
          invitee: '',
          email: '',
          image: undefined,
          mode: OrganisationMode.Simple
        }
      : {}
  })

  const create: ApiMutationResult<Organisation> = useMutation(
    (payload: CreateOrganisationDto) =>
      api.post<Organisation>('/organisations', { payload })
  )

  const update: ApiMutationResult<UpdateResult> = useMutation(
    (payload: CreateOrganisationDto) =>
      api.put<Organisation>('/organisations/:organisationId', {
        payload,
        organisationId: current.id
      })
  )

  const upload: ApiMutationResult<Image> = useMutation((file: File) => {
    const payload = new FormData()
    payload.append('image', file)
    return api.uploadFile<Image>('/images', { payload })
  })

  async function onSubmit(
    data: CreateOrganisationDto & { image?: File | 'DELETE' }
  ) {
    const { image, ...rest } = data
    const payload = stripBlankFields(rest)

    clearErrors()

    try {
      // Wait for image upload
      if (image instanceof File) {
        const { id } = await upload.mutateAsync(image)
        payload.imageId = id
      }

      // Explicit removal of image
      if (image === 'DELETE') {
        payload.imageId = null
      }

      if (isUpdate) {
        await toast.promise(update.mutateAsync(payload), {
          loading: <b>Saving...</b>,
          success: <b>Organisation updated</b>,
          error: <b>Error</b>
        })
      } else {
        await toast.promise(create.mutateAsync(payload), {
          loading: <b>Saving...</b>,
          success: <b>Organisation created</b>,
          error: <b>Error</b>
        })
      }
      onSave()
    } catch (e) {
      onError()
    }
  }

  const other = watch('type')
  const inviteUser = watch('invite_user')

  const { errors, isError, errorMessage, clearErrors } = useApiErrors(
    create.isError || update.isError,
    {
      ...create.error,
      ...update.error
    }
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h4 className="light mb-3">
        {isUpdate ? 'Edit organisation' : 'Create an organisation'}
      </h4>

      <Input
        register={register('name')}
        name="name"
        placeholder="Name"
        label="Name"
        error={errors.name}
      />

      <AvatarSelect
        label={`Upload organisation logo`}
        src={current && current.avatar ? current.avatar.url : undefined}
        onChange={async (result, file) => {
          if (current && current.avatar && !file) {
            setValue('image', 'DELETE')
          } else {
            setValue('image', file)
          }
        }}
      />

      <Input
        register={register('timezone')}
        name="timezone"
        placeholder="Timezone"
        label="Timezone"
        value="Etc/UTC"
        error={errors.timezone}
      />

      <Controller
        name="type"
        control={control}
        render={({ field }) => {
          return (
            <Select
              classNamePrefix="addl-class"
              options={organisationTypes}
              label="Type"
              inline={false}
              id="type"
              defaultValue={
                organisationTypes.filter((e) => e.value === current.type)[0]
              }
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

      <Controller
        name="mode"
        control={control}
        render={({ field }) => {
          return (
            <Select
              classNamePrefix="addl-class"
              options={organisationModes}
              label="Mode"
              inline={false}
              id="mode"
              defaultValue={
                organisationModes.filter((e) => e.value === current.mode)[0]
              }
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

      {other === OrganisationType.Other && (
        <Input
          register={register('type_other')}
          name="type_other"
          placeholder="Other"
          label="Other"
          error={errors.type_other}
        />
      )}

      {!isUpdate && (
        <Checkbox
          register={register('invite_user')}
          label="Invite user by email"
          name="invite_user"
        />
      )}

      {inviteUser && (
        <>
          <Input
            register={register('invitee')}
            name="invitee"
            placeholder="Name"
            label="Name"
            error={errors.invitee}
          />
          <Input
            register={register('email')}
            name="email"
            placeholder="Email address"
            label="Email address"
            type="email"
            error={errors.email}
          />
        </>
      )}

      {isError && (
        <Feedback message={errorMessage} type="error" className="mt-2" />
      )}

      <div className="text-right mt-2">
        <button
          className="button"
          disabled={create.isLoading || update.isLoading || upload.isLoading}>
          {isUpdate ? 'Save Organisation' : 'Create Organisation'}
        </button>
      </div>
    </form>
  )
}
