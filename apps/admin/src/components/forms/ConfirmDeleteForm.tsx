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
import { DeleteResult } from '@fitlink/api-sdk/types'
import { getErrorMessage } from '../../../../api-sdk'
import Feedback from '../elements/Feedback'
import useApiErrors from '../../hooks/useApiErrors'

export type ConfirmDeleteProps = {
  title?: string
  message: string
  current?: Partial<Organisation>
  mutation?: (id: string) => Promise<DeleteResult>
  onDelete?: () => void
  onCancel?: () => void
  onError?: () => void
  requireConfirmText?: string
}

const noop = () => {}

export default function ConfirmDeleteForm({
  title = 'Confirm delete action',
  message,
  current,
  mutation,
  onDelete = noop,
  onError = noop,
  onCancel = noop,
  requireConfirmText = ''
}: ConfirmDeleteProps) {
  const remove: ApiMutationResult<DeleteResult> = useMutation((id: string) =>
    mutation(id)
  )

  async function onSubmit(data: { confirm_text: string }) {
    if (requireConfirmText && requireConfirmText !== data.confirm_text) {
      return
    }

    try {
      await toast.promise(remove.mutateAsync(current.id), {
        loading: <b>Deleting...</b>,
        success: <b>Item deleted</b>,
        error: <b>Error</b>
      })
      if (!remove.isError) {
        onDelete()
      }
    } catch (e) {
      onError()
    }
  }

  const { register, handleSubmit, watch } = useForm()

  const confirmation = watch('confirm_text')

  const { isError, errorMessage } = useApiErrors(remove.isError, remove.error)

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h4 className="light mb-3">{title}</h4>

      <p>{message}</p>
      <br />

      {requireConfirmText && (
        <Input
          name="confirm_text"
          placeholder={`Type ${requireConfirmText} to proceed`}
          register={register('confirm_text')}
        />
      )}

      {isError && <Feedback message={errorMessage} type="error" />}

      <div className="text-right mt-4">
        <a className="button alt pointer" onClick={onCancel}>
          Cancel
        </a>
        <button
          className="button ml-1 pointer"
          type="submit"
          disabled={
            (requireConfirmText && confirmation !== requireConfirmText) ||
            remove.isLoading
          }>
          Confirm
        </button>
      </div>
    </form>
  )
}
