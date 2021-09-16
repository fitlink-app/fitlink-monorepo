#!/usr/bin/env bash
ENV_WHITELIST=${ENV_WHITELIST:-"^RN_"}
printf "Creating an .env file from prefixed ('RN_') environment values:\n"
printf "%s\n" $ENV_WHITELIST
set | egrep -e $ENV_WHITELIST | sed 's/^RN_//g' > .env.$RN_STAGE
printf "\n.env.$RN_STAGE created with contents:\n\n"
cat ".env.$RN_STAGE"