import { ApiProperty } from '@nestjs/swagger'
import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  ManyToOne,
  JoinColumn
} from 'typeorm'

import { CreatableEntity } from '../../../classes/entity/creatable'
import { User } from '../../users/entities/user.entity'

export enum AuthProviderType {
  Google = 'google.com',
  Apple = 'apple.com'
}

/*

Firebase data examples:

Note that only google is a separate provider. Apple uses the relay email address
and sets no password. For when we migrate users, we'll need to set a strong
randomized password on those users. They should also verify their email
address so they can reset their password.

{
  "providerId": "google.com",
  "rawId": "123456789",
  "email": "example@example.com",
  "displayName": "John Doe",
  "photoUrl": "https://lh3.googleusercontent.com/a-/AOh14GhdR5HjFPg6RbZqfHaczgK8wg-VJ3xwqtXkpnMrxw=s96-c"
},

{
  "localId": "abcdefg",
  "email": "example@privaterelay.appleid.com",
  "emailVerified": true,
  "lastSignedInAt": "1620956573071",
  "createdAt": "1620956573071",
  "providerUserInfo": []
},

*/

@Entity()
export class AuthProvider extends CreatableEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty()
  @ManyToOne(() => User, (user) => user.auth_providers)
  @JoinColumn()
  user: User

  @ApiProperty()
  @Column({
    enum: AuthProviderType
  })
  type: AuthProviderType

  @ApiProperty()
  @Column({
    nullable: true
  })
  raw_id?: string

  @ApiProperty()
  @Column({
    nullable: true
  })
  display_name?: string

  @ApiProperty()
  @Column({
    nullable: true
  })
  photo_url?: string

  @ApiProperty()
  @Column({
    nullable: true
  })
  email?: string
}
