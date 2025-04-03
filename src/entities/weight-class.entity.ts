import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, ID, Float } from 'type-graphql';
import { Fight } from './fight.entity';
import { Ranking } from './ranking.entity';

@ObjectType()
@Entity('weight_class')
export class WeightClass {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ length: 50, unique: true })
  name: string;

  @Field(() => Float)
  @Column('decimal', { precision: 5, scale: 2 })
  minWeightKg: number;

  @Field(() => Float)
  @Column('decimal', { precision: 5, scale: 2 })
  maxWeightKg: number;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @OneToMany(() => Fight, fight => fight.weightClass)
  fights: Fight[];

  @OneToMany(() => Ranking, ranking => ranking.weightClass)
  rankings: Ranking[];
}