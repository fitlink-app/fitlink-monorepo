import { Controller, Get } from '@nestjs/common'
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { User } from '../../decorators/authenticated-user.decorator'
import {
  ApiBaseResponses,
  PaginationBody,
  SuccessResponse
} from '../../decorators/swagger.decorator'
import { PaginationQuery } from '../../helpers/paginate'
import { AuthenticatedUser } from '../../models'
import { Pagination } from '../../decorators/pagination.decorator'
import { WalletTransactionsService } from './wallet-transactions.service'

@ApiTags('wallet-transactions')
@ApiBaseResponses()
@Controller()
export class WalletTransactionsController {
  constructor(
    private readonly walletTransactionService: WalletTransactionsService
  ) {}

  /**
   * 1. Superadmin can retrieve all leagues
   * 2. Ordinary users retrieve all public leagues not participating in
   * 3. Users belonging to teams and organisations can retrieve these leagues
   * 4. Owners of private leagues can also see their leagues (even if not participating)
   * @returns
   */
  @Get('/wallet-transactions')
  @ApiTags('wallet-transactions')
  // @ApiResponse({ type: LeaguePublicPagination, status: 200 })
  @PaginationBody()
  findAll(
    @User() authUser: AuthenticatedUser,
    @Pagination() pagination: PaginationQuery
  ) {
    return this.walletTransactionService.findAll(
      { user_id: authUser.id },
      pagination
    )
  }
}
