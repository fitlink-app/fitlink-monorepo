import React, { useContext, useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import Select from '../elements/Select'
import { Controller, useForm } from 'react-hook-form'
import { AddUserToSubscriptionDto } from '@fitlink/api/src/modules/subscriptions/dto/add-user-to-subscription.dto'
import { Organisation } from '@fitlink/api/src/modules/organisations/entities/organisation.entity'
import { AuthContext } from '../../context/Auth.context'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { ApiMutationResult, ApiResult } from '@fitlink/common/react-query/types'
import { BooleanResult, UpdateResult } from '@fitlink/api-sdk/types'
import Feedback from '../elements/Feedback'
import useApiErrors from '../../hooks/useApiErrors'
import {
  Subscription,
  SubscriptionUser
} from '@fitlink/api/src/modules/subscriptions/entities/subscription.entity'
import { User } from '../../../../api/src/modules/users/entities/user.entity'
import useDebounce from '../../hooks/useDebounce'

export type CreateSubscriptionProps = {
  current: {
    subscription?: Partial<Subscription>
    user?: Partial<User>
  }
  onSave?: () => void
  onError?: () => void
}

const noop = () => {}

const getFields = (current: Partial<Subscription> = {}) => ({
  id: current.id
})

export default function CreateSubscriptionUser({
  current = {},
  onSave = noop,
  onError = noop
}: CreateSubscriptionProps) {
  const organisationId =
    current && current.subscription && current.subscription.organisation
      ? current.subscription.organisation.id
      : ''
  const [searchTerm, setSearchTerm] = useState('')
  const { api, primary, focusRole } = useContext(AuthContext)
  const { register, handleSubmit, control, watch } = useForm({
    defaultValues: getFields(current.user)
  })

  const add: ApiMutationResult<SubscriptionUser> = useMutation(
    (payload: AddUserToSubscriptionDto) =>
      api.post<SubscriptionUser>(
        '/subscriptions/:subscriptionId/users',
        {
          payload,
          subscriptionId: current.subscription.id
        },
        {
          primary,
          useRole: focusRole
        }
      )
  )

  const dbSearchTerm = useDebounce(searchTerm, 500)

  const users: ApiResult<{
    results: Organisation[]
  }> = useQuery(
    `users_search_${organisationId}_${searchTerm}`,
    () =>
      api.list<User>('/organisations/:organisationId/users', {
        organisationId,
        query: {
          q: dbSearchTerm || undefined
        }
      }),
    {
      enabled: false,
      keepPreviousData: true
    }
  )

  const queryClient = useQueryClient()

  useEffect(() => {
    if (organisationId) {
      ;(async function () {
        await queryClient.cancelQueries()
        users.refetch()
      })()
    }
  }, [organisationId, dbSearchTerm])

  async function onSubmit(payload: AddUserToSubscriptionDto) {
    clearErrors()

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
      <h4 className="light mb-3">
        Move {current.user.name || 'user'} to this subscription
      </h4>

      <p>
        Add the user to this subscription and remove the user from all other
        subscriptions under this organisation.
      </p>

      <Controller
        name="id"
        control={control}
        render={({ field }) => {
          return (
            <Select
              classNamePrefix="addl-class"
              options={
                users.data
                  ? users.data.results.map((item) => ({
                      label: item.name,
                      value: item.id
                    }))
                  : []
              }
              label="User"
              inline={false}
              id="user_id"
              defaultValue={
                current.user
                  ? {
                      label: current.user.name,
                      value: current.user.id
                    }
                  : undefined
              }
              onInputChange={(newValue: string) => {
                setSearchTerm(newValue)
              }}
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

      {isError && (
        <Feedback message={errorMessage} type="error" className="mt-2" />
      )}

      <div className="text-right mt-2">
        <button className="button" disabled={add.isLoading}>
          Add User
        </button>
      </div>
    </form>
  )
}
