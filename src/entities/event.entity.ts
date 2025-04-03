import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { Fight } from './fight.entity';

@ObjectType()
@Entity('event')
export class Event {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ length: 100 })
  name: string;

  @Field()
  @Column()
  date: Date;

  @Field({ nullable: true })
  @Column({ length: 100, nullable: true })
  venue: string;

  @Field({ nullable: true })
  @Column({ length: 50, nullable: true })
  city: string;

  @Field({ nullable: true })
  @Column({ length: 50, nullable: true })
  country: string;

  @Field()
  @Column({ length: 50 })
  promotion: string;

  @Field({ nullable: true })
  @Column({ length: 255, nullable: true })
  posterUrl: string;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @OneToMany(() => Fight, fight => fight.event)
  fights: Fight[];
}