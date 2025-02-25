import React, { useContext, useEffect, useState } from 'react'
import Card from '../../components/elements/Card'
import Input from '../../components/elements/Input'
import Checkbox from '../../components/elements/Checkbox'
import Dashboard from '../../components/layouts/Dashboard'
import AvatarSelect from '../../components/elements/AvatarSelect'
import Feedback from '../../components/elements/Feedback'
import { useMutation } from 'react-query'
import { AuthContext } from '../../context/Auth.context'
import {
  DeleteResult,
  UpdateResult,
  UpdateUserAvatarDto,
  UpdateUserDto,
  UpdateUserEmailDto
} from '@fitlink/api-sdk/types'
import LoaderFullscreen from '../../components/elements/LoaderFullscreen'
import { useForm } from 'react-hook-form'
import { ApiMutationResult } from '@fitlink/common/react-query/types'
import { User } from '@fitlink/api/src/modules/users/entities/user.entity'
import { Image } from '@fitlink/api/src/modules/images/entities/image.entity'
import toast from 'react-hot-toast'
import useApiErrors from '../../hooks/useApiErrors'
import { UpdateUsersSettingDto } from '@fitlink/api/src/modules/users-settings/dto/update-users-setting.dto'
import Link from 'next/link'
import ConfirmDeleteForm from '../../components/forms/ConfirmDeleteForm'
import { timeout } from '../../helpers/timeout'
import { AnimatePresence } from 'framer-motion'
import Drawer from '../../components/elements/Drawer'
import { useRouter } from 'next/router'

export default function Profile() {
  const [warning, setWarning] = useState(false)
  const [wide, setWide] = useState(false)
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)

  const { api, user, refreshUser, focusRole } = useContext(AuthContext)
  const router = useRouter()

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

  const deleteUserAvatar: ApiMutationResult<DeleteResult> = useMutation(
    'delete_user_avatar',
    () => {
      return api.delete('/me/avatar', {})
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
      await deleteUserAvatar.mutateAsync({})
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
      <Dashboard title="Account Settings">
        <LoaderFullscreen />
      </Dashboard>
    )
  }

  const closeDrawer = (ms = 0) => async () => {
    if (ms) {
      await timeout(ms)
    }
    setDrawContent(null)
  }

  const DeleteForm = () => {
    setWarning(true)
    setDrawContent(
      <ConfirmDeleteForm
        onDelete={() => {
          closeDrawer(1000)()
          router.push('/logout')
        }}
        onCancel={closeDrawer()}
        current={{}}
        requireConfirmText="DELETE"
        mutation={() => api.delete(`/me`, {})}
        title="Delete your profile"
        message={`
          Are you sure you want to delete your profile? This is irreversible,
          and removes all your data including the removal of your account
          and data in the app. Note that this will not remove your team,
          organisation, or billing plan. Please use the "Permanently delete my team"
          option for this instead under Settings.
        `}
      />
    )
  }

  return (
    <Dashboard title="Account Settings">
      <h1 className="light">Account Settings</h1>

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
            <h2 className="h5 color-light-grey m-0">My profile settings</h2>
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

              <button
                className="button"
                disabled={
                  updateUserEmail.isLoading ||
                  updateUser.isLoading ||
                  updateUserAvatar.isLoading ||
                  deleteUserAvatar.isLoading
                }>
                Update
              </button>
              <Link href="/forgot-password">
                <button className="button alt ml-2">Reset password</button>
              </Link>
            </form>

            <em className="mt-2 flex">
              <small>
                You can manage more settings for your profile from the app.
              </small>
            </em>
          </Card>
          <Card className="p-3 card--stretch mt-3">
            <h3 className="h5 color-light-grey mb-3">Danger Zone</h3>
            <button
              className="button alt danger"
              type="button"
              onClick={() => DeleteForm()}>
              Permanently delete my account
            </button>
            <div className="mt-2">
              <small>
                Please note this does not remove the team and billing. If you
                need to remove these, please go to{' '}
                <Link passHref href="/settings">
                  <a href="/settings" className="color-primary">
                    Team Settings
                  </a>
                </Link>
              </small>
            </div>
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
              checked={
                user.settings
                  ? user.settings.newsletter_subscriptions_admin
                  : false
              }
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
              checked={
                user.settings
                  ? user.settings.newsletter_subscriptions_user
                  : false
              }
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
      <AnimatePresence initial={false}>
        {drawContent && (
          <Drawer
            remove={() => setDrawContent(null)}
            key="drawer"
            warnBeforeClose={warning}
            wide={wide}>
            {drawContent}
          </Drawer>
        )}
      </AnimatePresence>
    </Dashboard>
  )
}
