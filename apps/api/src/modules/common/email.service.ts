import { Injectable } from '@nestjs/common'
import { SESClient, SendTemplatedEmailCommand } from '@aws-sdk/client-ses'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class EmailService {
  sesClient: SESClient

  constructor(private configService: ConfigService) {
    this.sesClient = new SESClient({
      credentials: {
        accessKeyId: this.configService.get('SES_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('SES_SECRET_ACCESS_KEY')
      },
      region: this.configService.get('SES_REGION')
    })
  }

  async sendTemplatedEmail(
    template: TemplatesType,
    data: NodeJS.Dict<string>,
    toAddresses: string[],
    fromAddress = this.configService.get('EMAIL_DEFAULT_FROM_ADDRESS')
  ) {
    const templatedEmail = new SendTemplatedEmailCommand({
      Destination: {
        ToAddresses: toAddresses
      },
      Source: fromAddress,
      Template: template,
      TemplateData: JSON.stringify(data),
      ReplyToAddresses: [fromAddress],
      ConfigurationSetName: 'ConfigSet'
    })
    const result = await this.sesClient.send(templatedEmail)
    return result.MessageId
  }
}

export type TemplatesType =
  | 'email-verification'
  | 'password-reset'
  | 'receipt'
  | 'sign-in-with-email'
  | 'trial-ended'
  | 'updated-policy'
  | 'user-invitation'
  | 'user-removed-from-team'
  | 'welcome'
  | 'organisation-invitation'
  | 'team-invitation'
