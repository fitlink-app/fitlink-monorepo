import sharp = require('sharp')
import { FitEnum } from 'sharp'

type ImageMeta = { [key: string]: string }

// x,y
type ImageSize = [number, number]

export type ImageSizes = {
  [key: string]: ImageSize
}

export type OutputFormat = 'jpeg' | 'png' | 'webp' | 'tiff' | 'raw'

export type ResizedImage = {
  size: ImageSize
  buffer: Promise<Buffer>
  name: string
  meta?: ImageMeta
}

/**
 * Takes a buffer and sharp-specific arguments and returns a modified buffer
 *
 * @param source source buffer of the image to work with
 * @param size e.g: [512, 512]
 * @param fit one of 'contain', 'cover', 'fill', 'inside', 'outside' (https://sharp.pixelplumbing.com/api-resize#resize)
 * @param format optional arg for overriding output format (defaults to 'jpeg')
 */
export const resizeFromBuffer = (
  source: Buffer,
  size: ImageSize,
  fit: keyof FitEnum,
  format: OutputFormat = 'jpeg'
): Promise<Buffer> => {
  const imageProcess = sharp(source).resize(size[0], size[1], { fit }).rotate()
  imageProcess.toFormat(format)

  // Write output to a Buffer. JPEG, PNG, WebP, TIFF and RAW output are supported.
  return imageProcess.toBuffer()
}
