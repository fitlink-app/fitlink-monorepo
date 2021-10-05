import { Image } from '../../images/entities/image.entity'
import { User } from '../../users/entities/user.entity'
import { NotificationAction } from '../notifications.constants'

export class CreateNotificationDto {
  user: User
  avatar?: Image
  action: NotificationAction
  subject: string
  subject_id?: string
  meta_key?: string
  meta_value?: string
}
