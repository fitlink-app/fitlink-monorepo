import { Controller, Get, Post, Body, Put } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { AuthenticatedUser } from '../../models'
import { User as AuthUser } from '../../decorators/authenticated-user.decorator'
import { Pagination } from '../../decorators/pagination.decorator'
import { PaginationQuery } from '../../helpers/paginate'
import {
  PaginationBody,
  UpdateResponse
} from '../../decorators/swagger.decorator'
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

  @Put('/me/notifications/seen')
  @ApiTags('me')
  @UpdateResponse()
  markRead(
    @AuthUser() user: AuthenticatedUser,
    @Body() dto: NotificationSeenDto
  ) {
    return this.notificationsService.markSeen(user.id, dto.notificationIds)
  }

  @Put('/me/notifications/seen-all')
  @ApiTags('me')
  @UpdateResponse()
  updateSelf(@AuthUser() user: AuthenticatedUser) {
    return this.notificationsService.markAllSeen(user.id)
  }
}
