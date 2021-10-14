import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
export class FirebaseMigration {
  @PrimaryColumn()
  firebase_id: string

  @Column('uuid')
  entity_id: string
}
