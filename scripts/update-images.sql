UPDATE "image" SET "url" = REPLACE(url, 'http://localhost:9191/dev', 'https://develop-nest-fitlinkapp.s3.eu-west-2.amazonaws.com');
UPDATE "image" SET "url_128x128" = REPLACE(url, 'http://localhost:9191/dev', 'https://develop-nest-fitlinkapp.s3.eu-west-2.amazonaws.com');
UPDATE "image" SET "url_512x512" = REPLACE(url, 'http://localhost:9191/dev', 'https://develop-nest-fitlinkapp.s3.eu-west-2.amazonaws.com');
UPDATE "image" SET "url_640x360" = REPLACE(url, 'http://localhost:9191/dev', 'https://develop-nest-fitlinkapp.s3.eu-west-2.amazonaws.com');
