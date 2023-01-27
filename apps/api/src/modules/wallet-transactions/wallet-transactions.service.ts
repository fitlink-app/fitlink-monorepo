import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOneOptions, Repository } from 'typeorm'
import { Pagination, PaginationOptionsInterface } from '../../helpers/paginate'
import { WalletTransaction } from './entities/wallet-transaction.entity'

@Injectable()
export class WalletTransactionsService {
  constructor(
    @InjectRepository(WalletTransaction)
    private walletTransactionRepository: Repository<WalletTransaction>
  ) {}

  async findAll(
    where: FindOneOptions<WalletTransaction>['where'],
    { limit = 10, page = 0 }: PaginationOptionsInterface
  ) {
    const [results, total] =
      await this.walletTransactionRepository.findAndCount({
        where,
        take: limit,
        skip: page * limit
      })
    return new Pagination<WalletTransaction>({
      results,
      total
    })
  }
}
