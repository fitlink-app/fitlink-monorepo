#!/bin/node

/* eslint-disable */
const { promisify } = require('util')
const child_process = require('child_process');
const exec = promisify(child_process.exec)
const chalk = require("chalk")

const message = "You have pending migrations. Please run these first before generating new migrations."

;(async function(){
  const args = process.argv.reduce(( previous, current, index ) => {
    if( index > 1 ){
      previous.push( current )
      return previous
    } else {
      return []
    }
  })
  const command = "yarn run typeorm migration:show -f ./ormconfig.js " + args.join(" ")
  try {
    const { stdout }= await exec(command)
    if(check( stdout )){
      process.exit(1)
    }
  } catch( e ){
    if(check( e.stdout )){
      process.exit(1)
    }
  }
})()

function check( stdout ){
  if(stdout.indexOf('[ ]') > -1 ){
    console.log(stdout)
    console.log(chalk.yellow(message))
    process.exit(0);
  } else {
    console.log(chalk.green("No new migrations to run."))
    process.exit(0);
  }
}
