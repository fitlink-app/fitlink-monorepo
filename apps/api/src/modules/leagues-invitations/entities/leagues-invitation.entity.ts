import {
  PrimaryGeneratedColumn,
  Entity,
  OneToOne,
  JoinColumn,
  Column
} from 'typeorm'
import { CreatableEntity } from '../../../classes/entity/creatable'
import { Image } from '../../images/entities/image.entity'
import { League } from '../../leagues/entities/league.entity'
import { Team } from '../../teams/entities/team.entity'
import { User } from '../../users/entities/user.entity'

@Entity()
export class LeaguesInvitation extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @OneToOne(() => User)
  @JoinColumn()
  to_user: User

  @OneToOne(() => User)
  @JoinColumn()
  from_user: User

  @OneToOne(() => Image, { nullable: true })
  @JoinColumn()
  from_photo: Image

  @OneToOne(() => Team)
  @JoinColumn()
  team: Team

  @OneToOne(() => League)
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
