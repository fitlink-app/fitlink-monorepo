import { SetMetadata } from '@nestjs/common'

export const Uploads = (...args: string[]) => {
  let required = true
  if (args[args.length] === UploadOptions.Nullable) {
    required = false
    args.shift()
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
