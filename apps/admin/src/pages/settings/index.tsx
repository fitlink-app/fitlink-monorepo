import { useState, useEffect, useContext } from 'react'
import Card from '../../components/elements/Card'
import Input from '../../components/elements/Input'
import Select from '../../components/elements/Select'
import Checkbox from '../../components/elements/Checkbox'
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
  const { api, primary } = useContext(AuthContext)

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
      </div>
    </Dashboard>
  )
}
