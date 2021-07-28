import { useState } from 'react'
import Input from '../elements/Input'
import Select from '../elements/Select'
import { Controller, useForm } from 'react-hook-form'
import { CreateOrganisationDto } from '@fitlink/api/src/modules/organisations/dto/create-organisation.dto'
import { OrganisationType } from '@fitlink/api/src/modules/organisations/organisations.constants'
import Checkbox from '../elements/Checkbox'

export type CreateOrganisationProps = {
  current?: Partial<CreateOrganisationDto>
}

const organisationTypes = Object.keys(OrganisationType).map((key) => {
  return {
    label: key,
    value: OrganisationType[key]
  }
})

export default function CreateOrganisation({
  current
}: CreateOrganisationProps) {
  const { register, handleSubmit, control, watch } = useForm({
    defaultValues: current
      ? {
          name: current.name,
          timezone: current.timezone,
          type: current.type,
          type_other: current.type_other,
          invite_user: false,
          invitee: '',
          email: ''
        }
      : {}
  })

  function onSubmit(data: CreateOrganisationDto) {
    console.log(JSON.stringify(data))
  }

  const other = watch('type')
  const inviteUser = watch('invite_user')

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h4 className="light mb-3">
        {current ? 'Edit organisation' : 'Create an organisation'}
      </h4>

      <Input
        register={register('name')}
        name="name"
        placeholder="Name"
        label="Name"
      />

      <Input
        register={register('timezone')}
        name="timezone"
        placeholder="Timezone"
        label="Timezone"
        value="Etc/UTC"
      />

      <Controller
        name="type"
        control={control}
        render={({ field }) => {
          return (
            <Select
              classNamePrefix="addl-class"
              options={organisationTypes}
              label="Type"
              inline={false}
              id="type"
              onChange={(option) => {
                if (option) {
                  field.onChange(option.value)
                }
              }}
              onBlur={field.onBlur}
            />
          )
        }}
      />

      {other === OrganisationType.Other && (
        <Input
          register={register('type_other')}
          name="type_other"
          placeholder="Other"
          label="Other"
        />
      )}

      {!current && (
        <Checkbox
          register={register('invite_user')}
          label="Invite user by email"
          name="invite_user"
        />
      )}

      {inviteUser && (
        <>
          <Input
            register={register('invitee')}
            name="invitee"
            placeholder="Name"
            label="Name"
          />
          <Input
            register={register('email')}
            name="email"
            placeholder="Email address"
            label="Email address"
            type="email"
          />
        </>
      )}

      <div className="text-right mt-2">
        <button className="button">
          {current ? 'Save Organisation' : 'Create Organisation'}
        </button>
      </div>
    </form>
  )
}
