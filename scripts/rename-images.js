#!/bin/node

const { readdirSync, rename } = require('fs');
const { dirname, join } = require('path');

// Get path to image directory

// Get an array of the files inside the folder
const dir = join(dirname(__dirname), 's3', 'upload')
const files = readdirSync(dir);

// Loop through each file that was retrieved
files.forEach(file => rename( dir + `/${file}`, dir + `/${file.replace("._S3rver_object", "")}`, err => console.log(err) ));
