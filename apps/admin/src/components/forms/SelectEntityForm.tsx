import React, { useContext, useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import Select from '../elements/Select'
import { Controller, useForm } from 'react-hook-form'
import { CreateAdminDto } from '@fitlink/api/src/modules/users/dto/create-admin.dto'
import { AuthContext } from '../../context/Auth.context'
import { useQueryClient, UseQueryResult } from 'react-query'
import Feedback from '../elements/Feedback'
import useDebounce from '../../hooks/useDebounce'
import { Roles } from '@fitlink/api/src/modules/user-roles/user-roles.constants'
import { ResponseError } from '@fitlink/api-sdk/types'

export type CreateSubscriptionProps = {
  onSave?: () => void
  onError?: () => void
  onSubmit?: (payload: any) => void
  format?: (item: any) => { label: string; value: any }
  onSearch?: (term: string) => void
  query: UseQueryResult<{ results: any[] }, ResponseError>
  role?: Roles
}

const noop = () => {}

export default function SelectEntityForm({
  query,
  format,
  onSave = noop,
  onError = noop,
  onSubmit = noop,
  onSearch = noop,
  role
}: CreateSubscriptionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [data, setData] = useState<any[]>([])
  const { handleSubmit, control, setValue } = useForm({
    defaultValues: {
      id: undefined
    }
  })

  const dbSearchTerm = useDebounce(searchTerm, 500)

  const queryClient = useQueryClient()

  useEffect(() => {
    ;(async function () {
      await queryClient.cancelQueries()
      onSearch(dbSearchTerm)
      query.refetch()
    })()
  }, [dbSearchTerm])

  useEffect(() => {
    if (query.data && query.data.results) {
      setData(query.data.results)
    }
  }, [query.data])

  async function submit(payload: CreateAdminDto) {
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit(submit)}>
      {role}
      <div className="flex ai-c">
        <div className="w-40 mr-2">
          <Controller
            name="id"
            control={control}
            render={({ field }) => {
              return (
                <Select
                  classNamePrefix="addl-class"
                  options={
                    query.data
                      ? query.data.results.map((item) => format(item))
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
                      handleSubmit(submit)()
                    }
                  }}
                  onBlur={field.onBlur}
                />
              )
            }}
          />
        </div>
      </div>
    </form>
  )
}
