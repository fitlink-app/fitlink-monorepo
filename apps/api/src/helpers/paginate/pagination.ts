import { ApiProperty } from '@nestjs/swagger'
import { PaginationResultInterface } from './pagination.results.interface'

export class Pagination<PaginationEntity> {
  public results: PaginationEntity[]
  public page_total: number
  public total: number
  public remaining?: number

  constructor(paginationResults: PaginationResultInterface<PaginationEntity>) {
    this.results = paginationResults.results
    this.page_total = paginationResults.results.length
    this.total = paginationResults.total
  }
}

export class PaginationQuery {
  limit?: string
  page?: string
}

export class PaginationDto {
  @ApiProperty({ nullable: true, required: false })
  limit?: string
  @ApiProperty({ nullable: true, required: false })
  page?: string
}
