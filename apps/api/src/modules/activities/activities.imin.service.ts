import { Injectable, HttpService } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { map } from 'rxjs/operators'
import {
  IminResponseInterface,
  IminItem,
  IminServiceParams,
  IminEventScheduleDay,
  IminConvertedImage
} from './types/imin'
import { addDays, getISODay, setHours, setMinutes } from 'date-fns'
import { Activity, ActivityForMap } from './entities/activity.entity'
import { ActivityType } from './activities.constants'
import { Pagination } from '../../helpers/paginate'
import { Image } from '../images/entities/image.entity'

@Injectable()
export class ActivitiesIminService {
  static currencyMap: { [key: string]: string } = {
    GBP: '£',
    EUR: '€'
  }

  static weekdayMap: { [key: number]: IminEventScheduleDay } = {
    1: 'schema:Monday',
    2: 'schema:Tuesday',
    3: 'schema:Wednesday',
    4: 'schema:Thursday',
    5: 'schema:Friday',
    6: 'schema:Saturday',
    7: 'schema:Sunday'
  }

  constructor(
    private httpService: HttpService,
    private configService: ConfigService
  ) {}

  async findOne(id: string) {
    const result = await this.makeRequest(`events-api/v2/event-series/${id}`)
    return result
      .pipe(map((data: IminItem) => ActivitiesIminService.normalizeOne(data)))
      .toPromise()
  }

  async findAll(params: IminServiceParams) {
    // events-api/v2/event-series?geo[radial]=51.7520131%2C-1.2578499%2C5&mode=upcoming-sessions&page=1&limit=10" -H "accept: application/json" -H "X-API-KEY: "
    const results = await this.makeRequest('events-api/v2/event-series', {
      mode: 'discovery-geo',
      // genderRestriction: 'oa:NoRestriction',
      ...params
    })

    return results
      .pipe(map((data) => ActivitiesIminService.normalize(data || [])))
      .toPromise()
  }

  async findAllMarkers(params: IminServiceParams) {
    // events-api/v2/event-series?geo[radial]=51.7520131%2C-1.2578499%2C5&mode=upcoming-sessions&page=1&limit=10" -H "accept: application/json" -H "X-API-KEY: "
    const results = await this.makeRequest('events-api/v2/event-series', {
      mode: 'discovery-geo',
      // genderRestriction: 'oa:NoRestriction',
      ...params
    })

    return results
      .pipe(
        map((data) => ActivitiesIminService.normalizeForMarkers(data || []))
      )
      .toPromise()
  }

  /**
   * Makes a request to the configured IMIN endpoint.
   *
   * @param endpoint
   * @param params
   * @returns an observable containing the response data
   */
  async makeRequest(endpoint: string, params?: IminServiceParams) {
    return this.httpService
      .get(this.configService.get('IMIN_API_BASE_URL') + '/' + endpoint, {
        params,
        headers: {
          'X-API-KEY': this.configService.get('IMIN_API_KEY'),
          accept: 'application/json'
        },
        timeout: 3000
      })
      .pipe(map((response) => response.data))
  }

  /**
   * Normalizes a set of imin results to a standardised format
   *
   * @param results
   * @returns
   */
  static normalize(responseData: IminResponseInterface) {
    const results = (responseData['imin:item'] || []).map(
      ActivitiesIminService.normalizeOne
    ) as Activity[]

    return new Pagination<Activity>({
      results,
      total: responseData['imin:totalItems']
    })
  }

  static normalizeOne(item: IminItem) {
    return {
      id: item.id.split('/').pop(),
      name: item.name,
      description: item.description,
      organizer_name: item.organizer.name,
      organizer_url: item.organizer.url,
      organizer_telephone: item.organizer.telephone,
      organizer_email: item.organizer.email,
      organizer_image: ActivitiesIminService.getOrganizerImageUrl(item),
      date: ActivitiesIminService.itemScheduleToDateString(item),
      cost: ActivitiesIminService.getCost(item),
      images: ActivitiesIminService.getImages(item),
      activity: ActivitiesIminService.getActivity(item),
      ...ActivitiesIminService.getLocationData(item),

      // Imin activities are presumed to be classes
      type: ActivityType.Class,

      // These dates should be mocked to match the Activity entity
      created_at: new Date(),
      updated_at: new Date()
    }
  }

  /**
   * Normalizes a set of imin results to a standardised format
   * for map markers
   *
   * @param results
   * @returns
   */
  static normalizeForMarkers(responseData: IminResponseInterface) {
    const results = (responseData['imin:item'] || []).map((each) => ({
      id: each.id.split('/').pop(),
      name: each.name,
      date: ActivitiesIminService.itemScheduleToDateString(each),
      ...ActivitiesIminService.getLocationData(each),

      // Imin activities are presumed to be classes
      type: ActivityType.Class
    })) as Activity[]

    return new Pagination<ActivityForMap>({
      results,
      total: responseData['imin:totalItems']
    })
  }

  /**
   * Converts the date deeply nested in the IminItem
   * subEvent -> eventSchedule to a plain string
   * to signify the next available time.
   *
   * @param item
   * @returns string ("Monday at 15:00pm")
   */
  static itemScheduleToDateString(item: IminItem): string {
    const now = new Date()
    let start = now
    let compareDay = ActivitiesIminService.weekdayMap[getISODay(start)]
    let foundNextDate: Date
    let foundNextDay: string
    let foundNextTime: string
    ;(item.subEvent || []).forEach((each) => {
      ;(each.eventSchedule || []).forEach((schedule) => {
        schedule.byDay.reduce((previous: IminEventScheduleDay, current) => {
          if (compareDay === previous) {
            const HHmm = schedule.startTime.split(':').map((e) => parseInt(e))
            const nextDate = setHours(setMinutes(start, HHmm[1]), HHmm[0])
            if (nextDate > now) {
              // A previous date should be ignored, because a date
              // that is nearer into the future was found
              if (
                (foundNextDate && nextDate < foundNextDate) ||
                !foundNextDate
              ) {
                foundNextDate = nextDate
                foundNextTime = schedule.startTime
                foundNextDay = previous
              }

              return previous
            } else {
              // Try the next day, since the hour has passed that this event starts
              compareDay = current
              start = addDays(start, 1)
            }
          }
          return current
        })
      })
    })

    if (foundNextDay) {
      const day = foundNextDay.replace('schema:', '')
      const time = ActivitiesIminService.formatTime(foundNextTime)

      return `${day} at ${time}`
    }

    return null
  }

  /**
   * Formats a HH:aa time string to include am/pm for better readability
   * @param time
   * @returns string (e.g. "12.30pm")
   */
  static formatTime(time: string): string {
    const timeInt = parseInt(time.replace(':', ''))
    if (timeInt > 1159) {
      return time + 'pm'
    }
    return time + 'am'
  }

  /**
   * Formats ISO 4217 with associated currency symbol
   * @param currency e.g. GBP
   * @returns string (currency character e.g. £)
   */
  static formatCurrency(currency: string): string {
    const symbol = ActivitiesIminService.currencyMap[currency]
    return symbol || currency
  }

  /**
   * Conditionally returns information about cost
   * if it exists.
   *
   * @param item
   * @returns string (of price, e.g. £8.95)
   */
  static getCost(item: IminItem) {
    const offer = item['imin:aggregateOffer']
    if (offer && offer.publicAdult) {
      return (
        ActivitiesIminService.formatCurrency(offer.publicAdult.priceCurrency) +
        offer.publicAdult.price
      )
    } else {
      return null
    }
  }

  /**
   * Formats an array of activity to be a single line CSV
   *
   * @param item
   * @returns string (of activities, e.g. "Yoga, Pilates")
   */
  static getActivity(item: IminItem) {
    return (item.activity || []).reduce((prev, current, index: number) => {
      return (index > 0 ? prev + ', ' : '') + current.prefLabel
    }, '')
  }

  /**
   * Get organizer image url if available
   *
   * @param item
   * @returns string (url)
   */
  static getOrganizerImageUrl(item: IminItem) {
    if (item.organizer && (item.organizer.image || item.organizer.logo)) {
      return ({
        id: '0',
        url: item.organizer.logo
          ? item.organizer.logo.url
          : item.organizer.image.url,
        alt: item.organizer.name
      } as IminConvertedImage) as Image
    } else {
      return null
    }
  }

  /**
   * Formats an array of image objects
   *
   * @param item
   * @returns object  of image urls
   */
  static getImages(item: IminItem): Image[] {
    return (item.image || []).map((each, index: number) => {
      return ({
        id: index + '',
        url: each.url,
        alt: item.name
      } as IminConvertedImage) as Image
    }, '')
  }

  /**
   * Converts IminItem location information
   * Only takes the first location
   *
   * @param item
   * @returns location data object (meeting_point: [number, number], and meeting_point_text: string)
   */
  static getLocationData(item: IminItem) {
    const location = item['imin:locationSummary']
    if (location[0]) {
      return {
        meeting_point: {
          type: 'Point',
          coordinates: [location[0].geo.latitude, location[0].geo.longitude]
        },
        meeting_point_text: location[0].name
      }
    }
  }
}
