import { applyDecorators } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { Queueables } from '../constants/queueables'

export function OnQueue(event: Queueables) {
  return applyDecorators(
    OnEvent(event, {
      promisify: true
    })
  )
}
