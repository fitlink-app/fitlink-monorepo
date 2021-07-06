import { applyDecorators } from '@nestjs/common'
import {
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiProperty
} from '@nestjs/swagger'
import { DeleteResultDto } from '../classes/dto/delete'
import { UpdateResultDto } from '../classes/dto/update'
import { SuccessResultDto } from '../classes/dto/success'
import { ValidationResultDto } from '../classes/dto/validation'
import { ForbiddenErrorDto, ServerErrorDto } from '../classes/dto/error'
import { PaginationDto, Pagination } from '../helpers/paginate'

export function ApiBaseResponses() {
  return applyDecorators(
    ApiResponse({ type: ForbiddenErrorDto, status: 401 }),
    ApiResponse({ type: ServerErrorDto, status: 500 }),
    ApiBearerAuth()
  )
}

export function DeleteResponse() {
  return applyDecorators(ApiResponse({ type: DeleteResultDto, status: 200 }))
}

export function UpdateResponse() {
  return applyDecorators(ApiResponse({ type: UpdateResultDto, status: 200 }))
}

export function SuccessResponse(status = 200) {
  return applyDecorators(ApiResponse({ type: SuccessResultDto, status }))
}

export function ValidationResponse() {
  return applyDecorators(
    ApiResponse({ type: ValidationResultDto, status: 400 })
  )
}

export function PaginationBody() {
  return applyDecorators(ApiQuery({ type: PaginationDto }))
}

export function PaginationResponse(type: any) {
  class PaginationType {
    @ApiProperty()
    page_total: number

    @ApiProperty()
    total: number

    @ApiProperty({
      type: type,
      isArray: true
    })
    results: any[]
  }

  return applyDecorators(ApiResponse({ type: PaginationType, status: 200 }))
}
