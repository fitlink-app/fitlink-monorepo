import { HttpService, Injectable } from '@nestjs/common'
import { TemplatesType } from './email.service'
import { ConfigService } from '@nestjs/config'
import { map } from 'rxjs/operators'
import {v4 as uuidv4} from 'uuid';
import { tryAndCatch } from '../../helpers/tryAndCatch'

@Injectable()
export class GoogleAnalyticsService {

  constructor(
    private httpService: HttpService,
    private configService: ConfigService
  ) {}

  /**
   * Track email is sent
   * 
   * @param eventType
   * @param userId
   */
    async sendGoogleAnalitics(
        eventType: TemplatesType,
        eventCategory: eventCategory,
        userId?: string
    ) {
        const uuid = uuidv4();
        const params = {
          v: this.configService.get('GOOGLE_ANALYTICS_EMAIL_VERSION'),
          tid: this.configService.get('GOOGLE_ANALYTICS_EMAIL_TID'),
          cid: userId || uuid,
          t: 'event',
          ec: eventType,
          ea: eventCategory
        }
        const [response, responseErr] = await tryAndCatch(
          this.httpService
            .get(`${this.configService.get('GOOGLE_ANALYTICS_EMAIL_URL')}tid=${params.tid}&cid=${params.cid}&t=event&ec=email&ea=${params.ea}&v=${params.v}`, {
              headers: {
                'User-Agent': 'fitlink',
                accept: 'application/json'
              },
              timeout: 3000
            })
            .pipe(map((response) => response.data))
            .toPromise()
          )
          responseErr && console.error(responseErr.message)
        return `${this.configService.get('GOOGLE_ANALYTICS_EMAIL_URL')}tid=${params.tid}&cid=${params.cid}&t=${params.t}&ec=${params.ec}&ea=${params.ea}&v=${params.v}`
    }
}

export type eventCategory =
  | 'email-is-sent'
  | 'email-is-sent'
  | 'link-is-followed'
  | 'action-is-taken'