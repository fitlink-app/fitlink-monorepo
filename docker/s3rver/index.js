const S3rver = require('s3rver');
const { fromEvent } = require('rxjs');
const { filter } = require('rxjs/operators');
const { readFileSync } = require('fs');

const instance = new S3rver({
  port: 9191,
  address: '0.0.0.0',
  hostname: 'localhost',
  silent: false,
  directory: __dirname + '/tmp',
  configureBuckets: [
    {
      name: 'test',
      configs: [readFileSync(__dirname + '/cors.xml')]
    },
    {
      name: 'dev',
      configs: [readFileSync(__dirname + '/cors.xml')],
    },
  ],
  key: "fitlink",

}).run((err, { address, port } = {}) => {
  if (err) {
    console.error(err);
  } else {
    console.log('now listening at address %s and port %d', address, port);
  }
});

const s3Events = fromEvent(instance, 'event');
s3Events.subscribe((event) => console.log(event));
s3Events
  .pipe(filter((event) => event.Records[0].eventName == 'ObjectCreated:Copy'))
  .subscribe((event) => console.log(event));
