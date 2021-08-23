import { useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Input from '../elements/Input'
import { useForm } from 'react-hook-form'
import { OrganisationType } from '@fitlink/api/src/modules/organisations/organisations.constants'
import { AuthContext } from '../../context/Auth.context'
import { useMutation } from 'react-query'
import { ApiMutationResult } from '@fitlink/common/react-query/types'
import { UpdateResult } from '@fitlink/api-sdk/types'
import { stripBlankFields } from '@fitlink/api-sdk'
import Feedback from '../elements/Feedback'
import useApiErrors from '../../hooks/useApiErrors'
import AvatarSelect from '../elements/AvatarSelect'
import { Image } from '@fitlink/api/src/modules/images/entities/image.entity'
import { Team } from '@fitlink/api/src/modules/teams/entities/team.entity'
import { CreateTeamDto } from '@fitlink/api/src/modules/teams/dto/create-team.dto'

export type CreateTeamProps = {
  current?: Partial<Team>
  organisationId: string
  onSave?: () => void
  onError?: () => void
}

const noop = () => {}

export default function CreateOrganisation({
  current = {},
  organisationId,
  onSave = noop,
  onError = noop
}: CreateTeamProps) {
  const isUpdate = current && current.id
  const { api } = useContext(AuthContext)
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: current
      ? {
          name: current.name,
          image: undefined
        }
      : {}
  })

  const create: ApiMutationResult<Team> = useMutation(
    (payload: CreateTeamDto) => api.post<Team>('/teams', { payload })
  )

  const update: ApiMutationResult<UpdateResult> = useMutation(
    (payload: CreateTeamDto) =>
      api.put<Team>('/teams/:teamId', {
        payload,
        teamId: current.id
      })
  )

  const upload: ApiMutationResult<Image> = useMutation((file: File) => {
    const payload = new FormData()
    payload.append('image', file)
    return api.uploadFile<Image>('/images', { payload })
  })

  async function onSubmit(data: CreateTeamDto & { image?: File | 'DELETE' }) {
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
          success: <b>Team updated</b>,
          error: <b>Error</b>
        })
      } else {
        await toast.promise(create.mutateAsync(payload), {
          loading: <b>Saving...</b>,
          success: <b>Team created</b>,
          error: <b>Error</b>
        })
      }
      onSave()
    } catch (e) {
      onError()
    }
  }

  const { errors, isError, errorMessage, clearErrors } = useApiErrors(
    create.isError || update.isError,
    {
      ...create.error,
      ...update.error
    }
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h4 className="light mb-3">{isUpdate ? 'Edit team' : 'Create a team'}</h4>

      <Input
        register={register('name')}
        name="name"
        placeholder="Name"
        label="Name"
        error={errors.name}
      />

      <AvatarSelect
        label={`Upload team logo`}
        src={current && current.avatar ? current.avatar.url : undefined}
        onChange={async (result, file) => {
          if (current && current.avatar && !file) {
            setValue('image', 'DELETE')
          } else {
            setValue('image', file)
          }
        }}
      />

      {isError && (
        <Feedback message={errorMessage} type="error" className="mt-2" />
      )}

      <div className="text-right mt-2">
        <button
          className="button"
          disabled={create.isLoading || update.isLoading || upload.isLoading}>
          {isUpdate ? 'Save Team' : 'Create Team'}
        </button>
      </div>
    </form>
  )
}
