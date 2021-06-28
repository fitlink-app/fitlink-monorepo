import { Injectable } from '@nestjs/common'
import { SESClient, SendTemplatedEmailCommand } from '@aws-sdk/client-ses'
import { ConfigService } from '@nestjs/config'
import { writeFile, readFile } from 'fs/promises'

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

/** Mocks email to a file, also useful for development */
export class EmailServiceLocal extends EmailService {
  async sendTemplatedEmail(
    template: TemplatesType,
    data: NodeJS.Dict<string>,
    toAddresses: string[],
    fromAddress: string
  ) {
    const content = await this.appendEmailContent(
      template,
      data,
      toAddresses,
      fromAddress
    )
    await writeFile('email-debug.log', JSON.stringify(content, null, 2))
    return '1'
  }

  async appendEmailContent(
    template: TemplatesType,
    data: NodeJS.Dict<string>,
    toAddresses: string[],
    fromAddress = 'jest@example.com'
  ) {
    const content = await this.getEmailContent()
    content.push({
      data,
      template,
      toAddresses,
      fromAddress
    })
    return content
  }

  async emailHasContent(search: string) {
    const content = await readFile('email-debug.log')
    return content.toString().toLowerCase().indexOf(search.toLowerCase()) > -1
  }

  async getEmailContent() {
    try {
      const content = await readFile('email-debug.log')
      return JSON.parse(content.toString()) as {
        template: string
        data: NodeJS.Dict<string>
        toAddresses: string[]
        fromAddress: string
      }[]
    } catch (e) {
      return []
    }
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
  | 'league-invitation'
