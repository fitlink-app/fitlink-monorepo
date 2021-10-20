import {
  Catch,
  ArgumentsHost,
  Inject,
  HttpServer,
  HttpStatus,
  HttpException,
  HttpService
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BaseExceptionFilter } from '@nestjs/core'

/**
 * Catches 500 errors and sends them to a Slack
 * channel in the Fitink Slack workspace
 */

@Catch()
export class GlobalExceptionsFilter extends BaseExceptionFilter {
  constructor(
    httpAdapter: any,
    private httpService: HttpService,
    private configService: ConfigService
  ) {
    super(httpAdapter)
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    const webhookUrl = this.configService.get('SLACK_WEBHOOK_ERRORS_URL')

    if (status === HttpStatus.INTERNAL_SERVER_ERROR && webhookUrl) {
      const ctx = host.switchToHttp()
      const req = ctx.getRequest()
      const httpService = this.httpService

      const body = { ...req.body }
      if (body.password) {
        body.password = '*****'
      }

      if (webhookUrl && req.url.indexOf('api/v1') > -1) {
        httpService
          .post(webhookUrl, {
            text: `*500 Internal Server Error*`,
            color: '#C22F0F',
            attachments: [
              {
                color: '#C22F0F',
                text: `${req.url} (${req.headers.host})`
              },
              {
                color: '#C22F0F',
                text: `\`\`\`\`${JSON.stringify(body, null, 2)}\`\`\``
              },
              {
                color: '#C22F0F',
                text: `\`\`\`\`${String((exception as Error).stack)}\`\`\``
              }
            ]
          })
          .toPromise()
          .catch(console.error)
      }
    }

    super.catch(exception, host)
  }
}
