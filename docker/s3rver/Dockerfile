FROM node:14-alpine
RUN apk add --update nodejs nodejs-npm
RUN npm install s3rver rxjs
COPY . .
EXPOSE 9191
CMD ["node", "index.js"]
