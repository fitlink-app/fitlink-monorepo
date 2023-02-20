import { useContext, useState, useEffect } from 'react'
import Input from '../elements/Input'
import Checkbox from '../elements/Checkbox'
import League from '../elements/League'
import IconImage from '../icons/IconImage'
import Select from '../elements/Select'
import { add, addYears } from 'date-fns'
import DateInput from '../elements/DateInput'
import { League as LeagueEntity } from '@fitlink/api/src/modules/leagues/entities/league.entity'
import { CreateLeagueDto } from '@fitlink/api/src/modules/leagues/dto/create-league.dto'
import { AuthContext } from '../../context/Auth.context'
import { useForm } from 'react-hook-form'
import useFormMutations from '../../hooks/api/useFormMutations'
import useSports from '../../hooks/api/useSports'
import noop from 'lodash/noop'
import Feedback from '../elements/Feedback'
import { LeagueAccess } from '@fitlink/api/src/modules/leagues/leagues.constants'
import { UserRole } from '@fitlink/api/src/modules/user-roles/entities/user-role.entity'

export type LeagueFormProps = {
  current?: Partial<LeagueEntity>
  onSave?: () => void
  onError?: (err: any) => void
  onDelete?: (fields: Partial<LeagueEntity>) => void
}

const durations = [
  {
    label: '1 week',
    value: '7'
  },
  {
    label: '2 weeks',
    value: '14'
  },
  {
    label: '3 weeks',
    value: '21'
  },
  {
    label: '4 weeks',
    value: '28'
  }
]

const getFields = (league: Partial<LeagueEntity>) => {
  return {
    id: league.id,
    name: league.name,
    description: league.description,
    participants_total: league.participants_total,
    duration: league.duration,
    ends_at: league.ends_at,
    starts_at: league.starts_at,
    sport: league.sport ? league.sport.name : undefined,
    sportId: league.sport ? league.sport.id : undefined,
    rank: league.rank ? league.rank : undefined,
    repeat: league.repeat,
    access: league.access,
    image_upload: undefined
  }
}

export default function LeagueForm({
  current,
  onSave = noop,
  onDelete = noop,
  onError = noop
}: LeagueFormProps) {
  const { api, modeRole, primary } = useContext(AuthContext)
  const [image, setImage] = useState(current?.image?.url || '')
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const isUpdate = !!current.id
  const { sportsOptionsList } = useSports()
  const rankOptionsList = [
    { label: 'Newbie', value: 'newbie' },
    { label: 'Sportstar', value: 'sportstar' },
    { label: 'Semi-pro', value: 'semi-pro' },
    { label: 'Pro', value: 'pro' }
  ]

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      ...getFields(current),
      access: current.access === LeagueAccess.CompeteToEarn
    }
  })

  const { errors, createOrUpdate, uploadReplaceOrKeep } = useFormMutations<
    CreateLeagueDto,
    LeagueEntity
  >({
    type: 'League',
    isUpdate,
    create: (payload) => {
      // if payload.access is true it means "This is a compete to earn league" was clicked
      // and in that case we send CompeteToEarn as access, otherwise we default to public
      if (payload.access) {
        payload.access = LeagueAccess.CompeteToEarn
      } else {
        payload.access = LeagueAccess.Public
      }
      return api.post<LeagueEntity>(
        '/leagues',
        {
          payload
        },
        {
          primary,
          useRole: modeRole
        }
      )
    },
    update: (payload) => {
      if (payload.access) {
        payload.access = LeagueAccess.CompeteToEarn
      } else {
        payload.access = LeagueAccess.Public
      }
      return api.put<LeagueEntity>(
        `/leagues/:leagueId`,
        {
          payload,
          leagueId: current.id
        },
        {
          primary,
          useRole: modeRole
        }
      )
    }
  })

  const getRoles = async () => {
    const res = await api.get<UserRole>('/me/roles')
    if (res[0].role === 'super_admin') {
      setIsSuperAdmin(true)
    }
  }
  useEffect(() => {
    getRoles()
  }, [])
  const name = watch('name')
  const description = watch('description')
  const members = watch('participants_total')
  const endsAt = watch('ends_at')
  const startsAt = watch('starts_at')
  const duration = watch('duration')
  const repeats = watch('repeat')
  const access = watch('access')
  const sport = watch('sport') || 'Choose sport'
  const sportId = watch('sportId')
  const rank = watch('rank')

  async function onSubmit(
    data: CreateLeagueDto & {
      image_upload: File
      sport: string
      ends_at: Date
    }
  ) {
    const { image_upload, ends_at, sport, ...payload } = data

    try {
      // Handle images upload
      payload.imageId = await uploadReplaceOrKeep(
        image_upload,
        current.image ? current.image.id : undefined
      )

      await createOrUpdate(payload)

      onSave()
    } catch (e) {
      console.log(e)
      onError(e)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h4 className="light mb-3">
        {current.id ? 'Edit league' : 'New league'}
      </h4>
      <League
        image={image}
        name={name}
        description={description}
        members={members || 0}
        resetDate={endsAt || add(new Date(), { days: duration })}
        sport={sport}
        repeats={repeats}
        access={access ? 'competetoearn' : 'public'}
      />

      <div className="basic-file-select">
        <input
          type="file"
          id="image"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setImage(URL.createObjectURL(event.target.files[0]))
            setValue('image_upload', event.target.files[0])
          }}
          accept="image/*"
        />
        <IconImage />
        <label htmlFor="image">Select an image</label>
      </div>
      <div>
        {!!errors.imageId && (
          <Feedback type="error" message="An image must be provided" />
        )}
      </div>

      <Input
        name="name"
        placeholder="League name"
        label="League name"
        register={register('name')}
        error={errors.name}
      />
      <Input
        name="description"
        placeholder="Description"
        label="Description"
        type="textarea"
        register={register('description')}
        error={errors.description}
      />
      <DateInput
        label="Start date"
        name="startDate"
        startDate={startsAt ? new Date(startsAt) : new Date()}
        onChange={(v) => {
          setValue('starts_at', v)
        }}
        minDate={new Date()}
        maxDate={addYears(new Date(), 10)}
        error={errors.starts_at}
      />
      <Select
        id="duration"
        defaultValue={
          durations[
            durations.findIndex((x) => Number(x.value) === Number(duration))
          ]
        }
        isSearchable={false}
        options={durations}
        label="Duration"
        onChange={(item) => {
          setValue('duration', Number(item.value))
        }}
        error={errors.duration}
      />
      {!!sportsOptionsList.length && (
        <Select
          id="sport"
          name="sportId"
          defaultValue={
            sportsOptionsList[
              sportsOptionsList.findIndex((x) => x.value === sportId)
            ]
          }
          isSearchable={false}
          options={sportsOptionsList}
          label="Sport"
          onChange={(item) => {
            setValue('sportId', item.value)
            setValue('sport', item.label)
          }}
          error={errors.sportId}
        />
      )}

      {(modeRole === 'app' || isSuperAdmin) && !!rankOptionsList.length && (
        <Select
          id="rank"
          name="rank"
          defaultValue={
            rankOptionsList[
              rankOptionsList.findIndex((x) => Number(x.value) === rank)
            ]
          }
          isSearchable={false}
          options={rankOptionsList}
          label="Rank"
          onChange={(item) => {
            setValue('rank', Number(item.value))
          }}
          error={errors.rank}
        />
      )}

      <Checkbox
        label="This league repeats"
        name="repeats"
        checked={repeats}
        showSwitch={true}
        register={register('repeat')}
      />

      {(modeRole === 'app' || isSuperAdmin) && (
        <Checkbox
          label="This is a compete to earn league"
          name="access"
          checked={current.access === LeagueAccess.CompeteToEarn}
          showSwitch={true}
          register={register('access')}
        />
      )}

      <div className="text-right mt-2">
        {!!current.id && (
          <button
            className="button alt mr-2"
            type="button"
            onClick={() => {
              onDelete(current)
            }}>
            Delete
          </button>
        )}

        <button className="button" type="submit">
          {current ? 'Update' : 'Create league'}
        </button>
      </div>
    </form>
  )
}
