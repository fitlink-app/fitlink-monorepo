import React, { useContext, useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import Select from '../elements/Select'
import { Controller, useForm } from 'react-hook-form'
import { CreateAdminDto } from '@fitlink/api/src/modules/users/dto/create-admin.dto'
import { AuthContext } from '../../context/Auth.context'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { ApiMutationResult, ApiResult } from '@fitlink/common/react-query/types'
import Feedback from '../elements/Feedback'
import useApiErrors from '../../hooks/useApiErrors'
import { User } from '@fitlink/api/src/modules/users/entities/user.entity'
import useDebounce from '../../hooks/useDebounce'
import { UserRole } from '@fitlink/api/src/modules/user-roles/entities/user-role.entity'
import { Roles } from '../../../../api/src/modules/user-roles/user-roles.constants'
import { shortDescriptions } from '../../data/role-descriptions'

export type CreateSubscriptionProps = {
  onSave?: () => void
  onError?: () => void
  role?: Roles
  subscriptionId?: string
  teamId?: string
}

const noop = () => {}

export default function AssignUserForm({
  onSave = noop,
  onError = noop,
  role,
  subscriptionId,
  teamId
}: CreateSubscriptionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const { api, primary, modeRole, fetchKey } = useContext(AuthContext)
  const { handleSubmit, control, setValue } = useForm({
    defaultValues: {
      userId: undefined
    }
  })

  const add: ApiMutationResult<UserRole> = useMutation(
    (payload: CreateAdminDto) => {
      if (role === Roles.SubscriptionAdmin) {
        return api.post<UserRole>(
          '/organisations/:organisationId/subscriptions/:subscriptionId/admins',
          {
            payload,
            organisationId: primary.organisation,
            subscriptionId: subscriptionId
          }
        )
      } else if (role === Roles.TeamAdmin) {
        return api.post<UserRole>(
          '/organisations/:organisationId/teams/:teamId/admins',
          {
            payload,
            organisationId: primary.organisation,
            teamId: teamId
          }
        )
      } else {
        return api.post<UserRole>(
          '/admins',
          {
            payload
          },
          {
            primary,
            useRole: modeRole
          }
        )
      }
    }
  )

  const dbSearchTerm = useDebounce(searchTerm, 500)

  const users: ApiResult<{
    results: User[]
  }> = useQuery(
    `users_search_${fetchKey}_${searchTerm}`,
    () =>
      api.list<User>(
        '/users',
        {
          query: {
            q: dbSearchTerm || undefined
          }
        },
        {
          primary,
          useRole: modeRole
        }
      ),
    {
      enabled: false,
      keepPreviousData: true
    }
  )

  const queryClient = useQueryClient()

  useEffect(() => {
    ;(async function () {
      await queryClient.cancelQueries()
      users.refetch()
    })()
  }, [dbSearchTerm])

  async function onSubmit(payload: CreateAdminDto) {
    clearErrors()

    if (role) {
      payload.role = role
    }

    try {
      await toast.promise(add.mutateAsync(payload), {
        loading: <b>Saving...</b>,
        success: <b>Added</b>,
        error: <b>Error</b>
      })
      onSave()
    } catch (e) {
      onError()
    }
  }

  const { errors, isError, errorMessage, clearErrors } = useApiErrors(
    add.isError,
    add.error
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex ai-c">
        <div className="full-width mr-2">
          <h4 className="light mb-3">
            {role === Roles.Self && 'Assign a user to this team'}
            {role === Roles.OrganisationAdmin &&
              'Assign an organisation administrator'}
            {role === Roles.TeamAdmin && 'Assign a team administrator'}
            {role === Roles.SubscriptionAdmin &&
              'Assign a subscription administrator'}
            {role === Roles.SuperAdmin && 'Assign a super administrator'}
          </h4>

          <Feedback message={shortDescriptions[role]} className="mb-2" />

          <Controller
            name="userId"
            control={control}
            render={({ field }) => {
              return (
                <Select
                  classNamePrefix="addl-class"
                  placeholder="Select a user"
                  options={
                    users.data
                      ? users.data.results.map((item) => ({
                          label: `${item.name}`,
                          subLabel: item.email,
                          value: item.id
                        }))
                      : []
                  }
                  inline={false}
                  id="user_id"
                  defaultValue={null}
                  onInputChange={(newValue: string) => {
                    setSearchTerm(newValue)
                  }}
                  onChange={(option) => {
                    if (option) {
                      field.onChange(option.value)
                    }
                  }}
                  onBlur={field.onBlur}
                  error={errors.userId}
                />
              )
            }}
          />
        </div>

        <button className="button mt-2" disabled={add.isLoading} type="submit">
          Assign User
        </button>
      </div>

      {isError && (
        <Feedback message={errorMessage} type="error" className="mt-2" />
      )}
    </form>
  )
}
