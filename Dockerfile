# NOT CURRENTLY IN USE

FROM public.ecr.aws/lambda/nodejs:14

COPY dist/apps/api/serverless.js serverless/package.json serverless/yarn.lock  ${LAMBDA_TASK_ROOT}

RUN npm install -g yarn

RUN yarn install --frozen-lockfile

CMD [ "serverless.handler" ]
