import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpService
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthenticatedUser } from '../models/authenticated-user.model'

@Injectable()
export class FitlinkersGuard implements CanActivate {
  static userIds = {
    'c0e25f58-9658-48d4-99ca-a674c2c6a2c4': 'Luke',
    '78b97658-8dc5-43df-b3e9-8835d422b9a8': 'Martin',
    'ec05a22c-cce2-4caa-a030-9e7a9c203257': 'Paul'
  }

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const user = request.user as AuthenticatedUser
    if (
      user &&
      FitlinkersGuard.userIds[user.id] &&
      this.configService.get('FITLINKERS_DEBUG') === '1'
    ) {
      const webhookUrl = this.configService.get('SLACK_WEBHOOK_ERRORS_URL')
      this.httpService
        .post(webhookUrl, {
          text: `*DEBUG* ${FitlinkersGuard.userIds[user.id]}`,
          color: '#00FF00',
          attachments: [
            {
              color: '#00FF00',
              text: `${request.url} (${request.headers.host})`
            },
            {
              color: '#00FF00',
              text: `\`\`\`\`${JSON.stringify(request.body)}\`\`\``
            }
          ]
        })
        .toPromise()
        .catch(console.error)
    }
    return true
  }
}
