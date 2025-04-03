import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, Int } from 'type-graphql';
import { Fighter } from './fighter.entity';

@ObjectType()
@Entity('fighter_stats')
export class FighterStats {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column('uuid')
  fighterId: string;

  @Field(() => Int)
  @Column({ default: 0 })
  wins: number;

  @Field(() => Int)
  @Column({ default: 0 })
  losses: number;

  @Field(() => Int)
  @Column({ default: 0 })
  draws: number;

  @Field(() => Int)
  @Column({ default: 0 })
  noContests: number;

  @Field(() => Int)
  @Column({ default: 0 })
  knockouts: number;

  @Field(() => Int)
  @Column({ default: 0 })
  submissions: number;

  @Field(() => Int)
  @Column({ default: 0 })
  decisionWins: number;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Fighter, fighter => fighter.stats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fighter_id' })
  fighter: Fighter;
}