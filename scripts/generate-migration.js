#!/bin/node

/* eslint-disable */
const { promisify } = require('util')
const child_process = require('child_process');
const exec = promisify(child_process.exec)
const chalk = require("chalk")

const message = "You have pending migrations. Please run these first before generating new migrations."

;(async function(){
  let connection = "default"
  let migrationName = "Update"
  process.argv.forEach(( each, index ) => {
    if( each === "-c" ){
      connection = process.argv[index+1];
    }
    if( each === "-n" ){
      migrationName = process.argv[index+1];
    }
  })
  const command = "yarn run typeorm migration:show -f ./ormconfig.js -c " + connection
  try {
    const { stdout }= await exec(command)
    if(check( stdout )){
      process.exit(1)
    } else {
      console.log(chalk.green("No pending migrations, continuing to create new migration..."))
      try {
        const command = [
          "yarn run typeorm migration:generate",
          "-f ./ormconfig.js",
          "-d apps/api/database/migrations",
          "-c", connection,
          "-n", migrationName
         ].join(" ")
        const { stdout, stderr } = await exec(command)
        console.log(chalk.greenBright(stdout), chalk.redBright(stderr) )
        console.log(chalk.bgYellow.white(
          ["WARNING: Some typeorm migrations will result in columns unintentionally being dropped and recreated ",
          "leading to the loss of data. Be sure to check that the migration has been created correctly by manually reviewing it."].join('')
        ))
      } catch( e ){
        console.log( e.stdout, e.stderr );
      }
    }
  } catch( e ){
    if(check( e.stdout )){
      process.exit(1)
    } else {
      throw e
    }
  }
})()

function check( stdout ){
  if(stdout.indexOf('[ ]') > -1 ){
    console.log(stdout)
    console.log(chalk.yellow(message))
    process.exit(1);
  }
  return false
}
