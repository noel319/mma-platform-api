import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, ID, Float, Int } from 'type-graphql';
import { FighterStats } from './fighter-stats.entity';
import { Fight } from './fight.entity';
import { FightDetail } from './fight-detail.entity';
import { Ranking } from './ranking.entity';

@ObjectType()
@Entity('fighter')
export class Fighter {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ length: 50 })
  firstName: string;

  @Field()
  @Column({ length: 50 })
  lastName: string;

  @Field({ nullable: true })
  @Column({ length: 50, nullable: true })
  nickname: string;

  @Field({ nullable: true })
  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'integer', nullable: true })
  heightCm: number;

  @Field(() => Float, { nullable: true })
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  weightKg: number;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'integer', nullable: true })
  reachCm: number;

  @Field({ nullable: true })
  @Column({ length: 50, nullable: true })
  nationality: string;

  @Field({ nullable: true })
  @Column({ length: 100, nullable: true })
  team: string;

  @Field({ nullable: true })
  @Column({ length: 255, nullable: true })
  profileImageUrl: string;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @OneToMany(() => FighterStats, stats => stats.fighter)
  stats: FighterStats;

  @OneToMany(() => Fight, fight => fight.fighter1)
  fightsAsFighter1: Fight[];

  @OneToMany(() => Fight, fight => fight.fighter2)
  fightsAsFighter2: Fight[];

  @OneToMany(() => Fight, fight => fight.winner)
  fightsWon: Fight[];

  @OneToMany(() => FightDetail, fightDetail => fightDetail.fighter)
  fightDetails: FightDetail[];

  @OneToMany(() => Ranking, ranking => ranking.fighter)
  rankings: Ranking[];
}