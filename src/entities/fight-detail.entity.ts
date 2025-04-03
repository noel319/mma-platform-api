import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ObjectType, Field, ID, Int } from 'type-graphql';
import { Fighter } from './fighter.entity';
import { Fight } from './fight.entity';

@ObjectType()
@Entity('fight_detail')
@Unique(['fightId', 'fighterId'])
export class FightDetail {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column('uuid')
  fightId: string;

  @Field()
  @Column('uuid')
  fighterId: string;

  @Field(() => Int)
  @Column({ default: 0 })
  strikesLanded: number;

  @Field(() => Int)
  @Column({ default: 0 })
  strikesAttempted: number;

  @Field(() => Int)
  @Column({ default: 0 })
  significantStrikesLanded: number;

  @Field(() => Int)
  @Column({ default: 0 })
  significantStrikesAttempted: number;

  @Field(() => Int)
  @Column({ default: 0 })
  takedownsLanded: number;

  @Field(() => Int)
  @Column({ default: 0 })
  takedownsAttempted: number;

  @Field(() => Int)
  @Column({ default: 0 })
  submissionAttempts: number;

  @Field(() => Int)
  @Column({ default: 0 })
  reversals: number;

  @Field(() => Int)
  @Column({ default: 0 })
  controlTimeSeconds: number;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Fight, fight => fight.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fight_id' })
  fight: Fight;

  @ManyToOne(() => Fighter, fighter => fighter.fightDetails)
  @JoinColumn({ name: 'fighter_id' })
  fighter: Fighter;
}