import Input from '../elements/Input'
import { useContext } from 'react'
import { useForm } from 'react-hook-form'
import {
  UpdateUserDto,
  UpdateUserEmailDto,
  UpdateUserAvatarDto
} from '@fitlink/api/src/modules/users/dto/update-user.dto'
import useApiErrors from '../../hooks/useApiErrors'
import { ApiMutationResult } from '@fitlink/common/react-query/types'
import { User } from '@fitlink/api/src/modules/users/entities/user.entity'
import { useMutation } from 'react-query'
import { AuthContext } from '../../context/Auth.context'
import { BooleanResult, SendMessage } from '@fitlink/api-sdk/types'
import toast from 'react-hot-toast'
import { Image } from '../../../../api/src/modules/images/entities/image.entity'
import AvatarSelect from '../elements/AvatarSelect'
import Feedback from '../elements/Feedback'
import { AuthRequestResetPassword } from '@fitlink/api-sdk/types'
import { SendNotificationDto } from '@fitlink/api/src/modules/notifications/dto/send-notification.dto'

export type CreateMessageProps = {
  current: { id: string }
  onSave?: () => void
  onError?: () => void
}

const noop = () => {}

export default function MessageUser({
  current,
  onSave = noop,
  onError = noop
}: CreateMessageProps) {
  const { api, primary } = useContext(AuthContext)
  const { register, handleSubmit, control, watch, setValue } = useForm({
    defaultValues: {
      title: 'Keep it up!',
      body: undefined
    }
  })

  const send: ApiMutationResult<BooleanResult> = useMutation(
    (payload: SendNotificationDto) =>
      api.post<SendMessage>('/teams/:teamId/users/:userId/notifications', {
        payload,
        userId: current.id,
        teamId: primary.team
      })
  )

  async function onSubmit(payload: SendNotificationDto) {
    clearErrors()

    try {
      await toast.promise(send.mutateAsync(payload), {
        loading: <b>Sending message...</b>,
        success: <b>Message sent</b>,
        error: <b>Error</b>
      })
      onSave()
    } catch (e) {
      onError()
    }
  }

  const { errors, isError, errorMessage, clearErrors } = useApiErrors(
    send.isError,
    {
      ...send.error
    }
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h4 className="light mb-3">Edit user</h4>

      {isError && <Feedback message={errorMessage} type="error" />}

      <Input
        register={register('title')}
        name="title"
        placeholder="Title"
        label="Title"
        error={errors.title}
      />

      <Input
        register={register('body')}
        name="body"
        placeholder="Send a message of encouragement..."
        label="Message"
        error={errors.body}
        type="textarea"
      />

      <div className="text-right mt-2">
        <button type="submit" className="button" disabled={send.isLoading}>
          Send Message
        </button>
      </div>
    </form>
  )
}
