# NOT CURRENTLY IN USE

FROM public.ecr.aws/lambda/nodejs:14

COPY dist package.json  ${LAMBDA_TASK_ROOT}

RUN yarn install --frozen-lockfile

CMD [ "serverless.handler" ]
