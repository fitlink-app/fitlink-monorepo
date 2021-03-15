/**
 * This file is maintained manually and used for automated deployments.
 * Keep this file up to date in order for the CI to execute the handler
 * "migrate" provided by the serverless deployment.
 */
import { InitializeSchema1614887523112 } from '../database/migrations/1614887523112-InitializeSchema'
import { InitializeSchema1615794470267 } from '../database/migrations/1615794470267-InitializeSchema'

export default [InitializeSchema1614887523112, InitializeSchema1615794470267]
