import { BadRequestException } from '@nestjs/common'
import { ValidationError } from 'class-validator'

export function validationExceptionFactory(errors: ValidationError[]) {
  const errorMessages = {}
  errors.forEach((error) => {
    errorMessages[error.property] = capitalizeFirstLetter(
      Object.values(error.constraints)[0].replace(`${error.property}/g`, '')
    )
  })
  return new BadRequestException({
    errors: errorMessages,
    message: 'Validation failed'
  })
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
