#!/bin/node

/* eslint-disable */
const chalk = require("chalk")
const path = require('path')
const fs = require('fs/promises')

/**
 * What is this for?
 *
 * AWS Lambda has an upper limit on the size of the request to
 * update configuration, which has the effect of limiting the size
 * of environmental variables.
 *
 * A simple workaround is to inject the secrets into the source code
 * at build time on the CI.
 */
const env = {
  '{GITHUB_REPLACE_FIREBASE_ADMIN_CREDENTIAL}': process.env.FIREBASE_ADMIN_CREDENTIAL
}

//const distPath = path.join(path.dirname(__dirname), 'dist', 'apps', 'api', 'serverless.js')

const distPath = path.join(path.dirname(__dirname), 'artifacts/app.js')
;(async function(){
  const file = (await fs.readFile(distPath))
  let result = file.toString()
  const arr = Object.keys( env )
  arr.forEach(( k ) => {
    result = result.replace(k, env[k])
  })
  fs.writeFile(distPath, result, 'utf8', function (err) {
    if (err) return console.log(err);
  });

  console.log(chalk.green(`Replaced ${arr.length} key value pairs`))
})()
