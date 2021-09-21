import { Injectable } from '@nestjs/common'
import { SESClient, SendTemplatedEmailCommand } from '@aws-sdk/client-ses'
import { ConfigService } from '@nestjs/config'
import { promises } from 'fs'
import { GoogleAnalyticsService } from './google-analytics.service'

@Injectable()
export class EmailService {
  sesClient: SESClient

  constructor(
    private configService: ConfigService,
    private googleAnalyticsService: GoogleAnalyticsService
  ) {
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
    const GOOGLE_ANALYTICS_OPEN_EMAIL_URL = await this.googleAnalyticsService.sendGoogleAnalytics(
      template,
      'email-is-sent'
    )
    console.log(GOOGLE_ANALYTICS_OPEN_EMAIL_URL)
    data['GOOGLE_ANALYTICS_OPEN_EMAIL_URL'] = GOOGLE_ANALYTICS_OPEN_EMAIL_URL
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
@Injectable()
export class EmailServiceLocal {
  constructor(private googleAnalyticsService: GoogleAnalyticsService) {}

  async sendTemplatedEmail(
    template: TemplatesType,
    data: NodeJS.Dict<string>,
    toAddresses: string[],
    fromAddress: string,
    userId?: string
  ) {
    const GOOGLE_ANALYTICS_OPEN_EMAIL_URL = await this.googleAnalyticsService.sendGoogleAnalytics(
      template,
      'email-is-sent'
    )
    data['GOOGLE_ANALYTICS_OPEN_EMAIL_URL'] = GOOGLE_ANALYTICS_OPEN_EMAIL_URL
    const content = await this.appendEmailContent(
      template,
      data,
      toAddresses,
      fromAddress
    )
    await promises.writeFile(
      'email-debug.log',
      JSON.stringify(content, null, 2)
    )
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
    const content = await promises.readFile('email-debug.log')
    return content.toString().toLowerCase().indexOf(search.toLowerCase()) > -1
  }

  async getEmailContent() {
    try {
      const content = await promises.readFile('email-debug.log')
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
  | 'welcome-email'
  | 'welcome-email-admin'
  | 'organisation-invitation'
  | 'team-invitation'
  | 'league-invitation'
  | 'subscription-invitation'
  | 'team-admin-invitation'
