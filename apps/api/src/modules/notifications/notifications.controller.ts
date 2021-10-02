import { Controller, Get, Post, Body } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AuthenticatedUser } from '../../models'
import { User as AuthUser } from '../../decorators/authenticated-user.decorator'
import { Pagination } from '../../decorators/pagination.decorator'
import { PaginationQuery } from '../../helpers/paginate'
import { PaginationBody } from '../../decorators/swagger.decorator'
import { NotificationSeenDto } from './dto/notification-seen.dto'
import { NotificationsService } from './notifications.service'

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('/me/notifications')
  @ApiTags('me')
  @PaginationBody()
  findMyNotifications(
    @AuthUser() user: AuthenticatedUser,
    @Pagination() pagination: PaginationQuery
  ) {
    return this.notificationsService.findNotifications(user.id, pagination)
  }

  @Post('/me/notifications/seen')
  @ApiTags('me')
  markRead(
    @AuthUser() user: AuthenticatedUser,
    @Body() dto: NotificationSeenDto
  ) {
    return this.notificationsService.markSeen(user.id, dto.notificationIds)
  }
}
