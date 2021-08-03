import { useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Input from '../elements/Input'
import Select from '../elements/Select'
import { Controller, useForm } from 'react-hook-form'
import { CreateOrganisationDto } from '@fitlink/api/src/modules/organisations/dto/create-organisation.dto'
import { Organisation } from '@fitlink/api/src/modules/organisations/entities/organisation.entity'
import { OrganisationType } from '@fitlink/api/src/modules/organisations/organisations.constants'
import Checkbox from '../elements/Checkbox'
import { AuthContext } from '../../context/Auth.context'
import { useMutation } from 'react-query'
import { ApiMutationResult } from '@fitlink/common/react-query/types'
import { DeleteResult, UpdateResult } from '@fitlink/api-sdk/types'
import { getErrorMessage } from '../../../../api-sdk'
import Feedback from '../elements/Feedback'
import useApiErrors from '../../hooks/useApiErrors'

export type ConfirmProps = {
  title?: string
  message: string
  current?: Partial<Organisation>
  requireConfirmText?: string
  mutation: (current) => Promise<UpdateResult>
  onUpdate?: () => void
  onCancel?: () => void
  onError?: () => void
}

const noop = () => {}

export default function ConfirmForm({
  title = 'Confirm action',
  message,
  current,
  requireConfirmText = '',
  mutation,
  onUpdate = noop,
  onError = noop,
  onCancel = noop
}: ConfirmProps) {
  const { api } = useContext(AuthContext)

  const update: ApiMutationResult<UpdateResult> = useMutation(() =>
    mutation(current)
  )

  async function onSubmit(data: { confirm_text: string }) {
    if (requireConfirmText && requireConfirmText !== data.confirm_text) {
      return
    }
    try {
      await toast.promise(update.mutateAsync(current.id), {
        loading: <b>Updating...</b>,
        success: <b>Updated</b>,
        error: <b>Error</b>
      })
      if (!update.isError) {
        onUpdate()
      }
    } catch (e) {
      onError()
    }
  }

  const { handleSubmit, watch } = useForm()

  const confirmation = watch('confirm_text')

  const { isError, errorMessage } = useApiErrors(update.isError, update.error)

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h4 className="light mb-3">{title}</h4>

      <p>{message}</p>
      <br />

      {isError && <Feedback message={errorMessage} type="error" />}

      <div className="text-right mt-4">
        <a className="button alt pointer" onClick={onCancel}>
          Cancel
        </a>
        <button
          className="button ml-1 pointer"
          disabled={
            (requireConfirmText && confirmation !== requireConfirmText) ||
            update.isLoading
          }>
          Confirm
        </button>
      </div>
    </form>
  )
}
