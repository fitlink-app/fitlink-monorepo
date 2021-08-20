import { useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useMutation, useQuery } from 'react-query'
import { AuthContext, FocusRole } from '../../context/Auth.context'
import { ApiMutationResult, ApiResult } from '@fitlink/common/react-query/types'
import { formatISO, startOfDay, endOfDay } from 'date-fns'
import { Image } from '@fitlink/api/src/modules/images/entities/image.entity'
import { ImageFile } from '../../components/elements/ImageStack'

/**
 * Exposes 2 useful shorthand methods
 * for uploading a single image or uploading from a mixed array
 * of pre-existing images and new images
 */
export default function useUploadImages() {
  const { api } = useContext(AuthContext)

  const upload: ApiMutationResult<Image> = useMutation((file: File) => {
    const payload = new FormData()
    payload.append('image', file)
    return api.uploadFile<Image>('/images', { payload })
  })

  async function uploadReplaceOrKeep(image: File | null, original: string) {
    // Wait for image upload
    if (image instanceof File) {
      const { id } = await upload.mutateAsync(image)
      return id
    }

    // Explicitly delete or return the original
    if (image === null) {
      return null
    }

    return original
  }

  async function uploadAndMerge(images: ImageFile[]) {
    let allImages: string[] = images.filter((e) => e.id).map((e) => e.id)

    // Upload new images
    if (images.length) {
      const imagesToUpload = images.filter((each) => each.file)
      const promise = Promise.all(
        imagesToUpload.map((each) => {
          return upload.mutateAsync(each.file)
        })
      )

      if (imagesToUpload.length) {
        const results = await toast.promise(promise, {
          loading: <b>Uploading images...</b>,
          success: <b>Added images</b>,
          error: <b>Error uploading images</b>
        })
        allImages = allImages.concat(results.map((e) => e.id))
      }
    }

    return allImages.join(',')
  }

  return {
    upload,
    uploadReplaceOrKeep,
    uploadAndMerge
  }
}
