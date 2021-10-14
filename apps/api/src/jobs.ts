import { HttpService, INestApplicationContext } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ApiModule } from './api.module'
import { tryAndCatch } from './helpers/tryAndCatch'
import { LeaguesService } from './modules/leagues/leagues.service'
import { differenceInSeconds } from 'date-fns'
import { ConfigService } from '@nestjs/config'

async function processLeagues(module: INestApplicationContext) {
  const leaguesService = module.get(LeaguesService)
  return leaguesService.processPendingLeagues()
}

async function notifySlack(
  seconds: number,
  module: INestApplicationContext,
  results: NodeJS.Dict<any>[]
) {
  const httpService = module.get(HttpService)
  const configService = module.get(ConfigService)
  return httpService
    .post(configService.get('SLACK_WEBHOOK_JOBS_URL'), {
      text: `Jobs took ${seconds} seconds to run`,
      attachments: results.map((e) => ({ text: JSON.stringify(e) }))
    })
    .toPromise()
}

async function runAllJobs() {
  const started = new Date()
  const module = await NestFactory.createApplicationContext(ApiModule)
  const jobs = [processLeagues]
  const results = await Promise.all(
    jobs.map(async (job) => {
      const [result, error] = await tryAndCatch(job(module))
      error && console.error(error)
      result && console.log(result)
      return result
    })
  )

  await notifySlack(differenceInSeconds(new Date(), started), module, results)
}

runAllJobs()
