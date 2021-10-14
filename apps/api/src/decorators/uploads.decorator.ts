import { SetMetadata } from '@nestjs/common'

export const Uploads = (...args: string[]) => {
  let required = true

  if (args[args.length - 1] === UploadOptions.Nullable) {
    required = false
    args.pop()
  }
  return SetMetadata('uploads', {
    required,
    filenames: args
  })
}

export enum UploadOptions {
  /** Allow the request to succeed without a file attached */
  Nullable = 'Nullable',

  /** Request will throw an error if at least 1 file is not attached */
  Required = 'Required'
}

export type FileUploadOptions = {
  /** Number in mb */
  maxFileSize: number

  /** Type of upload */
  fileType: 'image' | 'file'
}

export const Upload = (options: FileUploadOptions) => {
  return SetMetadata('upload', options)
}
