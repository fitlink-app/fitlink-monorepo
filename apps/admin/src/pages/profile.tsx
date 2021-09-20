import React, { useContext, useEffect, useState } from 'react'
import Card from '../components/elements/Card'
import Input from '../components/elements/Input'
import Button from '../components/elements/Button'
import Select from '../components/elements/Select'
import Checkbox from '../components/elements/Checkbox'
import Dashboard from '../components/layouts/Dashboard'
import ImageSelect from '../components/elements/ImageSelect'
import AvatarSelect from '../components/elements/AvatarSelect'
import Feedback from '../components/elements/Feedback'
import { useMutation } from 'react-query'
import { AuthContext } from '../context/Auth.context'
import {
  UpdateResult,
  UpdateUserAvatarDto,
  UpdateUserDto,
  UpdateUserEmailDto
} from '../../../api-sdk/types'
import LoaderFullscreen from '../components/elements/LoaderFullscreen'
import { useForm } from 'react-hook-form'
import { ApiMutationResult } from '../../../common/react-query/types'
import { User } from '../../../api/src/modules/users/entities/user.entity'
import { Image } from '../../../api/src/modules/images/entities/image.entity'
import toast from 'react-hot-toast'
import useApiErrors from '../hooks/useApiErrors'
import { UpdateUsersSettingDto } from '../../../api/src/modules/users-settings/dto/update-users-setting.dto'

const currencies = [
  {
    value: 'GBP',
    label: 'GBP - British Pound'
  },
  {
    value: 'EUR',
    label: 'EUR - Euro'
  },
  {
    value: 'USD',
    label: 'USD - US Dollar'
  },
  {
    value: 'AUD',
    label: 'AUD - Australian Dollar'
  },
  {
    value: 'EAD',
    label: 'EAD - Emirati Dirham'
  }
]

export default function Profile() {
  const [company, setCompany] = useState('My Company LTD')
  const [currenct, setCurrency] = useState(currencies[0])
  const { api, user, refreshUser } = useContext(AuthContext)

  const resendEmail = useMutation('resend_verification', () => {
    return api.put<UpdateUserEmailDto>('/me/email', {
      payload: {
        email: user.email_pending || user.email
      }
    })
  })

  const updateUserEmail: ApiMutationResult<UpdateResult> = useMutation(
    'update_user',
    ({ email }: UpdateUserEmailDto) => {
      return api.put<UpdateUserEmailDto>('/me/email', {
        payload: {
          email
        }
      })
    }
  )

  const updateUser: ApiMutationResult<UpdateResult> = useMutation(
    'update_user',
    ({ name }: UpdateUserDto) => {
      return api.put<User>('/me', {
        payload: {
          name
        }
      })
    }
  )

  const updateUserAvatar: ApiMutationResult<UpdateResult> = useMutation(
    'update_user_avatar',
    ({ imageId }: UpdateUserAvatarDto) => {
      return api.put<UpdateUserAvatarDto>('/me/avatar', {
        payload: {
          imageId
        }
      })
    }
  )

  const updateSettings: ApiMutationResult<UpdateResult> = useMutation(
    'update_user_settings',
    (payload: UpdateUsersSettingDto) => {
      return api.put<UpdateUsersSettingDto>('/me/settings', {
        payload
      })
    }
  )

  const upload: ApiMutationResult<Image> = useMutation((file: File) => {
    const payload = new FormData()
    payload.append('image', file)
    return api.uploadFile<Image>('/images', { payload })
  })

  async function resendVerificationEmail(e: React.MouseEvent) {
    e.currentTarget.classList.add('active')
    try {
      toast.promise(resendEmail.mutateAsync(), {
        loading: <b>Sending...</b>,
        success: <b>Verification sent</b>,
        error: <b>Error</b>
      })
    } catch (e) {
      console.error(e)
    }
  }

  const { register, handleSubmit, control, watch, setValue } = useForm({
    defaultValues: {
      name: user ? user.name : undefined,
      email: user ? user.email : undefined,
      avatar: undefined
    }
  })

  const { errorMessage, errors } = useApiErrors(
    updateUserEmail.isError || updateUser.isError || updateUserAvatar.isError,
    {
      ...updateUserEmail.error,
      ...updateUser.error,
      ...updateUserAvatar.error
    }
  )

  useEffect(() => {
    if (user) {
      setValue('name', user.name)
      setValue('email', user.email)
    }
  }, [user])

  async function submit(payload: any) {
    const promises = []
    if (payload.email !== user.email) {
      promises.push(
        updateUserEmail.mutateAsync({
          email: payload.email
        })
      )
    }

    if (payload.name !== user.name) {
      promises.push(
        updateUser.mutateAsync({
          name: payload.name
        })
      )
    }

    // Wait for image upload
    if (payload.avatar instanceof File) {
      const imageUpload = upload.mutateAsync(payload.avatar)
      toast.promise(imageUpload, {
        loading: <b>Uploading avatar...</b>,
        success: <b>Uploaded</b>,
        error: <b>Error</b>
      })
      const { id } = await imageUpload
      await updateUserAvatar.mutateAsync({
        imageId: id
      })
    }

    // Explicit removal of image
    if (payload.avatar === 'DELETE') {
      await updateUserAvatar.mutateAsync({
        imageId: undefined
      })
    }

    try {
      toast.promise(Promise.all(promises), {
        loading: <b>Saving...</b>,
        success: <b>Updated</b>,
        error: <b>Error</b>
      })
    } catch (e) {
      console.error(e)
    }

    await Promise.all(promises)

    refreshUser()
  }

  if (!user) {
    return (
      <Dashboard title="Profile">
        <LoaderFullscreen />
      </Dashboard>
    )
  }

  return (
    <Dashboard title="Profile">
      <h1 className="light">Profile</h1>

      {(!user.email_verified || user.email_pending) && (
        <Feedback
          message={
            <>
              You still need to verify your email address.{' '}
              <a href="#resend" onClick={resendVerificationEmail}>
                Resend verification email
              </a>
            </>
          }
        />
      )}

      <div className="row mt-2 ai-s">
        <div className="col-12 col-md-6 col-xl-5 col-hd-4 mt-2">
          <Card className="p-3 card--stretch pb-4">
            <h2 className="h5 color-light-grey m-0">My account settings</h2>
            <form onSubmit={handleSubmit(submit)}>
              <Input
                name="name"
                placeholder="Your full name"
                label="Your full name"
                register={register('name')}
                error={errors.name}
              />
              <Input
                name="email"
                placeholder="Your email"
                label="Your email"
                register={register('email')}
                error={errors.email}
              />
              {user.email_pending ? (
                <small>
                  Pending email verification sent to {user.email_pending}
                </small>
              ) : null}
              <div className="mb-2">
                <AvatarSelect
                  label="Avatar"
                  src={
                    user && user.avatar ? user.avatar.url_128x128 : undefined
                  }
                  onChange={async (result, file) => {
                    if (user && user.avatar && !file) {
                      setValue('avatar', 'DELETE')
                    } else {
                      setValue('avatar', file)
                    }
                  }}
                />
              </div>

              {errorMessage && (
                <Feedback
                  message={errorMessage}
                  type={'error'}
                  className="my-2"
                />
              )}

              <button className="button" disabled={updateUserEmail.isLoading}>
                Update
              </button>
            </form>

            <em className="mt-2 flex">
              <small>
                You can manage more settings for your profile from the app.
              </small>
            </em>
          </Card>
        </div>
        <div className="col-12 col-md-6 col-xl-5 col-hd-4 mt-2">
          <Card className="p-3 card--stretch">
            <h3 className="h5 color-light-grey mb-3">
              Newsletter subscriptions
            </h3>
            <Checkbox
              label="Admin newsletter"
              name="admin_newsletter"
              checked={user.settings.newsletter_subscriptions_admin}
              showSwitch={true}
              onChange={async (checked) => {
                console.log(checked)
                await updateSettings.mutateAsync({
                  newsletter_subscriptions_admin: checked
                } as UpdateUsersSettingDto)
              }}
            />
            <p className="pl-7 pl-md-6">
              Receive important information, updates, and helpful tips to boost
              your employee wellness campaigns.
            </p>
            <Checkbox
              label="User newsletter"
              name="user_newsletter"
              checked={user.settings.newsletter_subscriptions_user}
              showSwitch={true}
              onChange={async (checked) => {
                console.log(checked)
                await updateSettings.mutateAsync({
                  newsletter_subscriptions_user: checked
                } as UpdateUsersSettingDto)
              }}
            />
            <p className="pl-7 pl-md-6">
              Receive information on app updates, new rewards, and tips to keep
              you inspired and motivated to achieve your wellness goals.
            </p>
          </Card>
        </div>
      </div>
    </Dashboard>
  )
}
