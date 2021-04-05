import { Image } from '../../images/entities/image.entity'

export type IminConvertedImage = Omit<
  Image,
  | 'url_128x128'
  | 'url_512x512'
  | 'url_640x360'
  | 'width'
  | 'height'
  | 'created_at'
  | 'updated_at'
  | 'type'
>

export interface IminServiceParams {
  'geo[radial]'?: string
  mode:
    | 'upcoming-sessions'
    | 'discovery-geo'
    | 'discovery-price-asc'
    | 'discovery-price-desc'
  isVirtual?: boolean
  isVirtuallyCoached?: boolean
  virtualIsInteractivityPreferred?: boolean
  virtualUsesParticipantSuppliedEquipment?: boolean
  'startDate[gte]'?: string //ISO-8601 2018-07-20T11:00:00Z
  'startDate[lte]'?: string //ISO-8601 2018-07-20T12:00:00Z
  'ageRange[includeRange]'?: string // min, max (or just min)
  'organizerName[textSearch]'?: string
  page: number
  limit: number
  genderRestriction?: 'oa:NoRestriction' | 'oa:MaleOnly' | 'oa:FemaleOnly'
}

interface IminImage {
  url: string
  thumbnail?: IminImage
}

interface IminActivity {
  type: 'Concept' | string
  prefLabel: string
}

interface IminOrganizer {
  url: string
  name: string
  telephone: string
  image?: {
    url: string
  }
}

interface IminAggregateOffer {
  publicAdult: {
    price: number
    priceCurrency: string
  }
}

interface IminLocationSummary {
  geo: {
    latitude: number
    longitude: number
  }
  name: string
}

export type IminEventScheduleDay =
  | 'schema:Monday'
  | 'schema:Tuesday'
  | 'schema:Wednesday'
  | 'schema:Thursday'
  | 'schema:Friday'
  | 'schema:Saturday'
  | 'schema:Sunday'

interface IminEventSchedule {
  startTime: string
  endTime: string
  byDay: IminEventScheduleDay[]
}

interface IminSubEvent {
  eventSchedule: IminEventSchedule[]
}

export interface IminItem {
  id: string
  name: string
  image: IminImage[]
  description: string
  activity: IminActivity[]
  organizer: IminOrganizer
  'imin:aggregateOffer': IminAggregateOffer
  'imin:locationSummary': IminLocationSummary[]
  subEvent: IminSubEvent[]
}

export interface IminResponseInterface {
  'imin:item': IminItem[]
  'imin:totalItems': number
  view: {
    'imin:totalPages': number
    'imin:itemsPerPage': number
    'imin:currentPage': number
  }
}

export type NormalizedExternalActivity = {
  id: string
  name: string
  description: string
  organizer_name: string
  organizer_url: string
  date: string
  cost: string
}
