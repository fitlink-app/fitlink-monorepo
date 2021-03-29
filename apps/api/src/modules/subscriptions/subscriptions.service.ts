import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateDefaultSubscriptionDto } from './dto/create-default-subscription.dto'
import { UpdateSubscriptionDto } from './dto/update-subscription.dto'
import { Subscription } from './entities/subscription.entity'

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionsRepository: Repository<Subscription>
  ) {}

  createDefault(createDefaultDto: CreateDefaultSubscriptionDto) {
    const { organisation, billing_entity } = createDefaultDto
    return this.subscriptionsRepository.save(
      this.subscriptionsRepository.create({
        billing_entity,
        organisation,
        default: true
      })
    )
  }

  findAll() {
    return `This action returns all subscriptions`
  }

  findOne(id: number) {
    return `This action returns a #${id} subscription`
  }

  update(id: number, updateSubscriptionDto: UpdateSubscriptionDto) {
    return `This action updates a #${id} subscription`
  }

  remove(id: string) {
    return this.subscriptionsRepository.delete(id)
  }

  removeMany(subscriptions: Subscription[]) {
    const ids = subscriptions.map((entity) => entity.id)
    return this.subscriptionsRepository
      .createQueryBuilder()
      .whereInIds(ids)
      .delete()
      .execute()
  }
}
