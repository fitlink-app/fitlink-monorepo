import { useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useMutation } from 'react-query'
import { ApiMutationResult } from '@fitlink/common/react-query/types'
import { UpdateResult } from '@fitlink/api-sdk/types'
import useApiErrors from '../useApiErrors'
import useUploadImages from './useUploadImages'

/**
 * Exposes useful mutations
 * for use in forms.
 */

export default function useFormMutations<Dto, Result>(props: {
  create: (payload: Dto) => Promise<Result>
  update: (payload: Dto) => Promise<UpdateResult>
}) {
  const { uploadReplaceOrKeep, uploadAndMerge } = useUploadImages()

  const create: ApiMutationResult<Result> = useMutation(props.create)
  const update: ApiMutationResult<UpdateResult> = useMutation(props.update)

  const errors = useApiErrors(create.isError || update.isError, {
    ...create.error,
    ...update.error
  })

  async function createOrUpdate(
    noun: string,
    isUpdate: boolean,
    payload: Dto,
    update: ApiMutationResult<UpdateResult>,
    create: ApiMutationResult<Result>
  ) {
    if (isUpdate) {
      return toast.promise(update.mutateAsync(payload), {
        loading: <b>Saving...</b>,
        success: <b>{noun} updated</b>,
        error: <b>Error</b>
      })
    }

    return toast.promise(create.mutateAsync(payload), {
      loading: <b>Saving...</b>,
      success: <b>{noun} created</b>,
      error: <b>Error</b>
    })
  }

  return {
    createOrUpdate,
    create,
    update,
    uploadReplaceOrKeep,
    uploadAndMerge,
    ...errors
  }
}
