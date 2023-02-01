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
export const resizeFromBuffer = async (
  source: Buffer,
  size: ImageSize,
  fit: keyof FitEnum,
  format: OutputFormat = 'jpeg'
) => {
  const width = size[0]
  let height = size[1]

  if (height === 0) {
    height = null
  }

  const sharpImage = sharp(source)

  const metadata = await sharpImage.metadata()

  const imageProcess = sharpImage
    .rotate()
    .resize(width, height, { fit, withoutEnlargement: true })

  const imageFormat =
    metadata.hasAlpha || metadata.format === 'png' ? 'png' : format

  imageProcess.toFormat(imageFormat, { quality: 80 })

  const buffer = await imageProcess.toBuffer()

  // Write output to a Buffer. JPEG, PNG, WebP, TIFF and RAW output are supported.
  return { buffer, format: imageFormat }
}
