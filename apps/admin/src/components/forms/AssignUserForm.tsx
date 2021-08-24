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

export type CreateSubscriptionProps = {
  onSave?: () => void
  onError?: () => void
}

const noop = () => {}

export default function AssignUserForm({
  onSave = noop,
  onError = noop
}: CreateSubscriptionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const { api, primary, focusRole, fetchKey } = useContext(AuthContext)
  const { handleSubmit, control, setValue } = useForm({
    defaultValues: {
      userId: undefined
    }
  })

  const add: ApiMutationResult<UserRole> = useMutation(
    (payload: CreateAdminDto) =>
      api.post<UserRole>(
        '/admins',
        {
          payload
        },
        {
          primary,
          useRole: focusRole
        }
      )
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
          useRole: focusRole
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
        <div className="w-40 mr-2">
          <Controller
            name="userId"
            control={control}
            render={({ field }) => {
              return (
                <Select
                  classNamePrefix="addl-class"
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
                />
              )
            }}
          />
        </div>

        <button className="button" disabled={add.isLoading}>
          Assign User
        </button>
      </div>

      {isError && (
        <Feedback message={errorMessage} type="error" className="mt-2" />
      )}
    </form>
  )
}
