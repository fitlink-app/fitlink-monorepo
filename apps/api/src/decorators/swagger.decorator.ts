import { applyDecorators } from '@nestjs/common'
import { ApiResponse, ApiQuery } from '@nestjs/swagger'
import { DeleteResultDto } from '../classes/dto/delete'
import { UpdateResultDto } from '../classes/dto/update'
import { SuccessResultDto } from '../classes/dto/success'
import { ForbiddenErrorDto, ServerErrorDto } from '../classes/dto/error'
import { PaginationDto } from '../helpers/paginate'

export function ApiBaseResponses() {
  return applyDecorators(
    ApiResponse({ type: ForbiddenErrorDto, status: 401 }),
    ApiResponse({ type: ServerErrorDto, status: 500 })
  )
}

export function DeleteResponse() {
  return applyDecorators(ApiResponse({ type: DeleteResultDto, status: 200 }))
}

export function UpdateResponse() {
  return applyDecorators(ApiResponse({ type: UpdateResultDto, status: 200 }))
}

export function SuccessResponse() {
  return applyDecorators(ApiResponse({ type: SuccessResultDto, status: 200 }))
}

export function PaginationBody() {
  return applyDecorators(ApiQuery({ type: PaginationDto }))
}
