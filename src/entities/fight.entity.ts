import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, Int } from 'type-graphql';
import { Fighter } from './fighter.entity';
import { Event } from './event.entity';
import { WeightClass } from './weight-class.entity';
import { FightDetail } from './fight-detail.entity';

export enum ResultType {
  KNOCKOUT = 'KNOCKOUT',
  TECHNICAL_KNOCKOUT = 'TECHNICAL_KNOCKOUT',
  SUBMISSION = 'SUBMISSION',
  DECISION_UNANIMOUS = 'DECISION_UNANIMOUS',
  DECISION_SPLIT = 'DECISION_SPLIT',
  DECISION_MAJORITY = 'DECISION_MAJORITY',
  DRAW = 'DRAW',
  NO_CONTEST = 'NO_CONTEST',
  DISQUALIFICATION = 'DISQUALIFICATION'
}

@ObjectType()
@Entity('fight')
export class Fight {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column('uuid')
  eventId: string;

  @Field()
  @Column('uuid')
  fighter1Id: string;

  @Field()
  @Column('uuid')
  fighter2Id: string;

  @Field()
  @Column('uuid')
  weightClassId: string;

  @Field()
  @Column({ default: false })
  isTitleFight: boolean;

  @Field()
  @Column({ default: false })
  isMainEvent: boolean;

  @Field(() => Int)
  @Column()
  scheduledRounds: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  actualRounds: number;

  @Field(() => String, { nullable: true })
  @Column({ type: 'enum', enum: ResultType, nullable: true })
  resultType: ResultType;

  @Field({ nullable: true })
  @Column('uuid', { nullable: true })
  winnerId: string;

  @Field({ nullable: true })
  @Column({ type: 'time', nullable: true })
  finishTime: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  finishRound: number;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Event, event => event.fights, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => Fighter, fighter => fighter.fightsAsFighter1)
  @JoinColumn({ name: 'fighter1_id' })
  fighter1: Fighter;

  @ManyToOne(() => Fighter, fighter => fighter.fightsAsFighter2)
  @JoinColumn({ name: 'fighter2_id' })
  fighter2: Fighter;

  @ManyToOne(() => WeightClass, weightClass => weightClass.fights)
  @JoinColumn({ name: 'weight_class_id' })
  weightClass: WeightClass;

  @ManyToOne(() => Fighter, fighter => fighter.fightsWon, { nullable: true })
  @JoinColumn({ name: 'winner_id' })
  winner: Fighter;

  @OneToMany(() => FightDetail, fightDetail => fightDetail.fight)
  details: FightDetail[];
}