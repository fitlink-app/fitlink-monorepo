import { useState, useEffect, useContext } from 'react'
import Card from '../../components/elements/Card'
import Input from '../../components/elements/Input'
import Dashboard from '../../components/layouts/Dashboard'
import ImageSelect from '../../components/elements/ImageSelect'
import { useQuery } from 'react-query'
import { AuthContext } from '../../context/Auth.context'
import { Team } from '@fitlink/api/src/modules/teams/entities/team.entity'
import { useForm } from 'react-hook-form'
import { UpdateTeamDto } from '@fitlink/api/src/modules/teams/dto/update-team.dto'
import { Image } from '@fitlink/api/src/modules/images/entities/image.entity'
import toast from 'react-hot-toast'
import Button from '../../components/elements/Button'
import Feedback from '../../components/elements/Feedback'
import ConfirmDeleteForm from '../../components/forms/ConfirmDeleteForm'
import { AnimatePresence } from 'framer-motion'
import Drawer from '../../components/elements/Drawer'
import { useRouter } from 'next/router'
import { timeout } from '../../helpers/timeout'
import Link from 'next/link'
import { Roles } from '@fitlink/api/src/modules/user-roles/user-roles.constants'

type TeamFormValues = {
  id?: string
  name: string
  avatar:
    | File
    | {
        url?: string
      }
}

export default function components() {
  const { api, primary, switchRole } = useContext(AuthContext)
  const [warning, setWarning] = useState(false)
  const [wide, setWide] = useState(false)
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)
  const router = useRouter()

  const { register, setValue, handleSubmit, reset } = useForm({
    defaultValues: {
      id: null,
      name: '',
      avatar: {
        url: undefined
      }
    } as TeamFormValues
  })

  const team = useQuery(
    'team',
    () => {
      return api.get<Team>('/teams/:teamId', {
        teamId: primary.team
      })
    },
    {
      enabled: false,
      initialData: {
        id: undefined,
        name: '',
        avatar: {
          url: undefined
        }
      } as Team
    }
  )

  useEffect(() => {
    if (primary.team) {
      team.refetch()
    }
  }, [primary])

  useEffect(() => {
    if (team.data && team.data.id) {
      setValue('name', team.data.name)
      setValue('avatar', team.data.avatar)
    }
  }, [team.data])

  async function onSubmit(payload: Partial<Team>) {
    const update: UpdateTeamDto = {}
    if (payload.avatar && payload.avatar instanceof File) {
      const teamAvatar = new FormData()
      teamAvatar.append('file', payload.avatar)

      try {
        const image = await toast.promise(
          api.uploadFile<Image>('/images', {
            payload: teamAvatar
          }),
          {
            error: <b>Error uploading image</b>,
            success: <b>Team logo uploaded</b>,
            loading: <b>Uploading team logo</b>
          }
        )
        update.imageId = image.id
      } catch (e) {
        console.error(e)
      }
    }
    update.name = payload.name

    await toast.promise(
      api.put<Team>('/teams/:teamId', {
        payload: update,
        teamId: primary.team
      }),
      {
        error: <b>Error updating team</b>,
        success: <b>Team updated</b>,
        loading: <b>Updating team</b>
      }
    )

    team.refetch()
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
        onDelete={async () => {
          closeDrawer(1000)()
          await switchRole({ role: Roles.Self })
          await router.push('/start')
        }}
        onCancel={closeDrawer()}
        current={{}}
        requireConfirmText="DELETE"
        mutation={() =>
          api.delete(`/organisations/:organisationId`, {
            organisationId: primary.organisation
          })
        }
        title="Delete your team"
        message={`
          Are you sure you want to delete your team? This is irreversible,
          and removes all team data including leagues, rewards, activities, statistics,
          and associations with other users. This will not remove your personal profile data,
          which you can do from the profile settings page, or from the app itself.
        `}
      />
    )
  }

  return (
    <Dashboard title="Settings">
      <h1 className="light">Settings</h1>
      <div className="row mt-2 ai-s">
        <div className="col-12 col-md-6 col-xl-5 col-hd-4 mt-2">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="p-3 card--stretch pb-4">
              <h2 className="h5 color-light-grey m-0">General team settings</h2>
              <Input
                name="team"
                placeholder="Team name"
                label="Team name"
                register={register('name')}
              />

              <ImageSelect
                filename={team.data.avatar ? team.data.avatar.url : undefined}
                label="Team logo"
                backgroundSize="80%"
                className="mb-0"
                onChange={(e) => {
                  setValue('avatar', e.target.files[0])
                }}
              />

              {!team.data.avatar && (
                <Feedback
                  message="You still need to upload a team logo"
                  className="mt-2"
                />
              )}

              <div className="flex jc-e">
                <Button label="Update" type="submit" className="mt-2" />
              </div>
            </Card>
          </form>
        </div>
        <div className="col-12 col-md-6 col-xl-5 col-hd-4 mt-2">
          <Card className="p-3 card--stretch pb-4">
            <h2 className="h5 color-light-grey m-0 mb-2">Danger Zone</h2>
            <button
              className="button alt danger"
              type="button"
              onClick={() => DeleteForm()}>
              Permanently Delete My Team
            </button>
            <div className="mt-2">
              <small>
                Please note this does not remove your personal user account. If
                you only need to remove this, please go to{' '}
                <Link passHref href="/settings/profile">
                  <a href="/settings/profile" className="color-primary">
                    Profile Settings
                  </a>
                </Link>
                , or alternatively delete your account from the app.
              </small>
            </div>
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
