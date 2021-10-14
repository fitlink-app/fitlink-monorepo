import { useState, useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useMutation } from 'react-query'
import { ApiMutationResult } from '@fitlink/common/react-query/types'
import { UpdateResult } from '@fitlink/api-sdk/types'
import useApiErrors from '../useApiErrors'
import useUploadImages from './useUploadImages'
import { timeout } from '../../helpers/timeout'

/**
 * Exposes useful mutations
 * for use in forms.
 */

export default function useFormMutations<Dto, Result>(props: {
  type: string
  isUpdate: boolean
  create: (payload: Dto) => Promise<Result>
  update: (payload: Dto) => Promise<UpdateResult>
}) {
  const { uploadReplaceOrKeep, uploadAndMerge } = useUploadImages()
  const [busy, setBusy] = useState(false)
  const create: ApiMutationResult<Result> = useMutation(props.create)
  const update: ApiMutationResult<UpdateResult> = useMutation(props.update)

  const errors = useApiErrors(create.isError || update.isError, {
    ...create.error,
    ...update.error
  })

  async function createOrUpdate(payload: Dto) {
    if (busy) {
      return
    }

    setBusy(true)

    let result: UpdateResult | Result
    try {
      if (props.isUpdate) {
        result = await toast.promise(update.mutateAsync(payload), {
          loading: <b>Saving...</b>,
          success: <b>{props.type} updated</b>,
          error: <b>Error</b>
        })
      } else {
        result = await toast.promise(create.mutateAsync(payload), {
          loading: <b>Saving...</b>,
          success: <b>{props.type} created</b>,
          error: <b>Error</b>
        })
      }

      // Don't accept submissions (prevent accidental double clicks)
      timeout(1000).then(() => {
        setBusy(false)
      })
    } catch (e) {
      setBusy(false)
      throw e
    }

    return result
  }

  return {
    createOrUpdate,
    uploadReplaceOrKeep,
    uploadAndMerge,
    ...errors
  }
}
