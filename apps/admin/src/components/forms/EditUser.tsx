import Input from '../elements/Input'
import { useContext } from 'react'
import { useForm } from 'react-hook-form'
import { UpdateUserDto, UpdateUserEmailDto, UpdateUserAvatarDto } from '@fitlink/api/src/modules/users/dto/update-user.dto'
import useApiErrors from '../../hooks/useApiErrors'
import { ApiMutationResult } from '@fitlink/common/react-query/types'
import { User } from '@fitlink/api/src/modules/users/entities/user.entity'
import { useMutation } from 'react-query'
import { AuthContext } from '../../context/Auth.context'
import { UpdateResult } from '@fitlink/api-sdk/types'
import toast from 'react-hot-toast'
import { Image } from '../../../../api/src/modules/images/entities/image.entity'
import AvatarSelect from '../elements/AvatarSelect'
import Feedback from '../elements/Feedback'
import { AuthRequestResetPassword } from '@fitlink/api-sdk/types'

export type CreateUserProps = {
  current:  Partial<UpdateUserDto> & Partial<UpdateUserEmailDto> & Partial<UpdateUserAvatarDto> & { id: string, avatar?: Image },
  onSave?: () => void,
  onError?: () => void
}

const noop = () => {}

export default function EditUser({
  current,
  onSave = noop,
  onError = noop
}: CreateUserProps) {

  const { api } = useContext(AuthContext)
  const { register, handleSubmit, control, watch, setValue } = useForm({
    defaultValues: current
      ? {
          name: current.name,
          email: current.email,
          image: undefined
        }
      : {}
  })

  const update: ApiMutationResult<UpdateResult> = useMutation(
    (payload: UpdateUserDto) =>
      api.put<User>('/users/:userId', {
        payload,
        userId: current.id
      })
  )

  const upload: ApiMutationResult<Image> = useMutation((file: File) => {
    const payload = new FormData()
    payload.append('image', file)
    return api.uploadFile<Image>('/images', { payload })
  })

  async function onSubmit(
    data: Partial<UpdateUserDto> & Partial<UpdateUserEmailDto> & Partial<UpdateUserAvatarDto> & { id: string, avatar?: Image } & { image?: File | 'DELETE' }
  ) {
    const { image, ...payload } = data

    clearErrors()

    try {
      // Wait for image upload
      if (image instanceof File) {
        const { id } = await upload.mutateAsync(image)
        payload.imageId = id
      }

      // Explicit removal of image
      if (image === 'DELETE') {
        payload.avatar = null
      }

      await toast.promise(update.mutateAsync(payload), {
        loading: <b>Saving...</b>,
        success: <b>User updated</b>,
        error: <b>Error</b>
      })
      onSave()
    } catch (e) {
      onError()
    }
  }

  const { errors, isError, errorMessage, clearErrors } = useApiErrors(update.isError, {
    ...update.error
  })

  const sendPasswordResetEmail = async() => {
    console.log(current.email)
        await toast.promise(api.post<AuthRequestResetPassword>('/auth/request-password-reset', { payload: { email: current.email}}), {
          loading: <b>Sending...</b>,
          success: <b>Email sent</b>,
          error: <b>Error</b>
        })
        
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h4 className="light mb-3">
        Edit user
      </h4>

      {isError && <Feedback message={errorMessage} type="error" />}

      <Input
        register={register('name')}
        name="name"
        placeholder="Name"
        label="Name"
        error={errors.name}
      />
      
      <AvatarSelect
        label={`Upload user photo`}
        src={current && current.avatar ? current.avatar.url : undefined}
        onChange={async (result, file) => {
          if (current && current.avatar && !file) {
            setValue('image', 'DELETE')
          }
          else {
            setValue('image', file)
          }
        }}
      />

      <Input
        register={register('email')}
        name="email"
        placeholder="Email address"
        label="Email address"
        type="email"
        error={errors.email}
      />
      
      <div className="text-right mt-2">
        <button 
          type='button'

          className={'button'}
          onClick={sendPasswordResetEmail}>
            Generate a password reset email
          </button>
      </div>

      <div className="text-right mt-2">
        <button 
          type='submit'
          className="button"
          disabled={update.isLoading || upload.isLoading}>
          Save User
        </button>
      </div>
    </form>
  )
}