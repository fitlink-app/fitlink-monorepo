import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  BadRequestException
} from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { AuthenticatedUser } from '../../models'
import { User as AuthUser } from '../../decorators/authenticated-user.decorator'
import { Pagination } from '../../decorators/pagination.decorator'
import { PaginationQuery } from '../../helpers/paginate'
import {
  PaginationBody,
  SuccessResponse,
  UpdateResponse
} from '../../decorators/swagger.decorator'
import { NotificationSeenDto } from './dto/notification-seen.dto'
import { NotificationsService } from './notifications.service'
import { NotificationPayload } from './notifications.constants'
import { SendNotificationDto } from './dto/send-notification.dto'
import { Iam } from '../../decorators/iam.decorator'
import { Roles } from '../user-roles/user-roles.constants'

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

  @Iam(Roles.TeamAdmin)
  @Post('/teams/:teamId/users/:userId/notifications')
  @ApiTags('users')
  @SuccessResponse()
  async sendGenericNotification(
    @AuthUser() user: AuthenticatedUser,
    @Body() { title, body }: SendNotificationDto,
    @Param('teamId') teamId: string
  ) {
    const result = await this.notificationsService.sendGenericMessage(
      user.id,
      teamId,
      {
        notification: { title, body }
      }
    )

    if (!result) {
      throw new BadRequestException(
        'Unable to send message to this user. Their device may not allow push notifications.'
      )
    }

    return result
  }
}
