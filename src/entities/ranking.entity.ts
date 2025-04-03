import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ObjectType, Field, ID, Int, Float } from 'type-graphql';
import { Fighter } from './fighter.entity';
import { WeightClass } from './weight-class.entity';

@ObjectType()
@Entity('ranking')
@Unique(['weightClassId', 'position', 'updatedAt'])
@Unique(['weightClassId', 'fighterId', 'updatedAt'])
export class Ranking {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column('uuid')
  fighterId: string;

  @Field()
  @Column('uuid')
  weightClassId: string;

  @Field(() => Int)
  @Column()
  position: number;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  points: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  previousPosition: number;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Fighter, fighter => fighter.rankings)
  @JoinColumn({ name: 'fighter_id' })
  fighter: Fighter;

  @ManyToOne(() => WeightClass, weightClass => weightClass.rankings)
  @JoinColumn({ name: 'weight_class_id' })
  weightClass: WeightClass;
}