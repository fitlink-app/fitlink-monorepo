import Input from '../elements/Input'
import { useContext } from 'react'
import { useForm } from 'react-hook-form'
import {
  UpdateUserDto,
  UpdateUserEmailDto,
  UpdateUserAvatarDto
} from '@fitlink/api/src/modules/users/dto/update-user.dto'
import useApiErrors from '../../hooks/useApiErrors'
import { ApiMutationResult, ApiResult } from '@fitlink/common/react-query/types'
import { User } from '@fitlink/api/src/modules/users/entities/user.entity'
import { useMutation, useQuery } from 'react-query'
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
import { HealthActivity } from '@fitlink/api/src/modules/health-activities/entities/health-activity.entity'

export type UserDetailType =
  | 'app_activity_info'
  | 'app_system_info'
  | 'message_user'

export type CreateMessageProps = {
  current: Partial<User>
  type: UserDetailType
  onSave?: () => void
  onError?: () => void
}

const noop = () => {}

export default function UserDetail({
  current,
  type,
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

  const {
    data
  }: ApiResult<{ user: User; activity: HealthActivity }> = useQuery(
    `user_info_${current.id}`,
    () => {
      return api.get('/teams/:teamId/users/:userId', {
        userId: current.id,
        teamId: primary.team
      })
    }
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
      {isError && <Feedback message={errorMessage} type="error" />}

      {type === 'message_user' && (
        <>
          <h4 className="light mb-3">Send message</h4>
          <Feedback
            message={`Send a push notification directly to the user's device.`}
          />
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
            placeholder={`Send a message of encouragement to ${current.name}...`}
            label="Message"
            error={errors.body}
            type="textarea"
          />

          <div className="text-right mt-2">
            <button type="submit" className="button" disabled={send.isLoading}>
              Send Message
            </button>
          </div>
        </>
      )}

      {type === 'app_activity_info' && (
        <>
          <h4 className="light mb-3">User status information</h4>
          <h6>Rank</h6>
          <p>{current.rank}</p>
          <hr className="tight" />
          <h6>Total points</h6>
          <p>{current.points_total.toLocaleString()}</p>
          <hr className="tight" />

          {data && data.user && (
            <>
              <h6>Leagues Joined</h6>
              <p>{data.user.leagues.length}</p>
              <hr className="tight" />
              <h6>Rewards Claimed</h6>
              <p>{data.user.rewards_redemptions.length}</p>
              <hr className="tight" />
            </>
          )}
          {data && data.activity && (
            <>
              <h6>Last Activity Date</h6>
              <p>
                {data.activity.created_at
                  ? format(
                      new Date(data.activity.created_at),
                      'yyyy-MM-dd H:mm:ss OOOO'
                    )
                  : '-'}
              </p>
              <hr className="tight" />
              <h6>Last Activity Type</h6>
              <p>{data.activity.sport.name}</p>
            </>
          )}
        </>
      )}

      {type === 'app_system_info' && (
        <>
          <h4 className="light mb-3">User system information</h4>
          <h6>Date Joined</h6>
          <p>
            {format(new Date(current.created_at), 'yyyy-MM-dd H:mm:ss OOOO')}
          </p>
          <hr className="tight" />
          <h6>Last Login</h6>
          <p>
            {format(
              new Date(current.last_app_opened_at || current.last_login_at),
              'yyyy-MM-dd H:mm:ss OOOO'
            )}
          </p>
          <hr className="tight" />
          <h6>Device Operating System</h6>
          <p>{current.mobile_os || '-'}</p>
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

          <hr className="tight" />
          <h6>Connected Trackers</h6>
          {current.providers.length > 0 && (
            <p>
              {current.providers
                .map((p) => ProviderTypeDisplay[p.type])
                .join(', ')}
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
        </>
      )}
    </form>
  )
}
