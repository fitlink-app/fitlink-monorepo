import {
  PrimaryGeneratedColumn,
  Entity,
  JoinColumn,
  Column,
  ManyToOne
} from 'typeorm'
import { CreatableEntity } from '../../../classes/entity/creatable'
import { League } from '../../leagues/entities/league.entity'
import { User } from '../../users/entities/user.entity'

@Entity()
export class LeaguesInvitation extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User)
  @JoinColumn()
  to_user: User

  @ManyToOne(() => User)
  @JoinColumn()
  from_user: User

  @ManyToOne(() => League)
  @JoinColumn()
  league: League

  @Column({
    default: false
  })
  accepted: boolean

  @Column({
    default: false
  })
  dismissed: boolean
}
