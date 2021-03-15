import { Sport } from '../../src/modules/sports/entities/sport.entity'
import { define } from 'typeorm-seeding'

define(Sport, () => {
  const sport = new Sport()
  // Values must be provided
  return sport
})
