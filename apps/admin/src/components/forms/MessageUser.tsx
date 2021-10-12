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
import { format } from 'date-fns'
import { ProviderTypeDisplay } from '@fitlink/api/src/modules/providers/providers.constants'
import IconClose from '../icons/IconClose'
import IconCheck from '../icons/IconCheck'

export type CreateMessageProps = {
  current: Partial<User>
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
      <h4 className="light mb-3">{current.name}</h4>

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

      <h6>Date joined</h6>
      <p>{format(new Date(current.created_at), 'yyyy-MM-dd H:mm:ss OOOO')}</p>
      <hr className="tight" />
      <h6>Completed onboarding</h6>
      {current.onboarded ? (
        <p>
          <div className="unconfirmed">
            <IconClose />
          </div>
        </p>
      ) : (
        <p>
          <div className="confirmed">
            <IconCheck />
          </div>
        </p>
      )}

      {/* <hr className="tight" /> */}
      {/* <h6>Mobile operating system</h6>
      <p>{mobile_os}</p> */}
      <hr className="tight" />
      <h6>Connected trackers</h6>
      {current.providers.length > 0 && (
        <p>
          {current.providers.map((p) => ProviderTypeDisplay[p.type]).join(', ')}
        </p>
      )}
      {!current.providers.length && (
        <p>
          <div className="unconfirmed">
            <IconClose />
          </div>
        </p>
      )}

      <hr className="tight" />
      <h6>Last app session</h6>
      {current.last_app_opened_at && (
        <p>
          {format(
            new Date(current.last_app_opened_at),
            'yyyy-MM-dd H:mm:ss OOOO'
          )}
        </p>
      )}
      {!current.last_app_opened_at && <p>-</p>}

      <hr className="tight" />
      <h6>Total points</h6>
      <p>{current.points_total.toLocaleString()}</p>
      <hr className="tight" />
      <h6>Rank</h6>
      <p>{current.rank}</p>
      {/* <hr className="tight" />
      <h6>Last activity tracked</h6>
      <p>{last_activity}</p> */}
      {/* <hr className="tight" />
      <h6>Leagues joined</h6>
      <p>{total_leagues.toLocaleString()}</p>
      <hr className="tight" />
      <h6>Leagues created</h6>
      <p>{created_leagues.toLocaleString()}</p>
      <hr className="tight" />
      <h6>Rewards redeemed</h6>
      <p>{rewards.toLocaleString()}</p> */}
    </form>
  )
}
