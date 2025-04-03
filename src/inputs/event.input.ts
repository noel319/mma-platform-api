import { InputType, Field } from 'type-graphql';
import { IsNotEmpty, IsOptional, IsDate, Length } from 'class-validator';

@InputType()
export class CreateEventInput {
  @Field()
  @IsNotEmpty({ message: 'Event name is required' })
  @Length(1, 100, { message: 'Event name must be between 1 and 100 characters' })
  name: string;

  @Field()
  @IsNotEmpty({ message: 'Event date is required' })
  date: Date;

  @Field({ nullable: true })
  @IsOptional()
  @Length(0, 100, { message: 'Venue must be less than 100 characters' })
  venue?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Length(0, 50, { message: 'City must be less than 50 characters' })
  city?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Length(0, 50, { message: 'Country must be less than 50 characters' })
  country?: string;

  @Field()
  @IsNotEmpty({ message: 'Promotion is required' })
  @Length(1, 50, { message: 'Promotion must be between 1 and 50 characters' })
  promotion: string;

  @Field({ nullable: true })
  @IsOptional()
  posterUrl?: string;
}

@InputType()
export class UpdateEventInput {
  @Field({ nullable: true })
  @IsOptional()
  @Length(1, 100, { message: 'Event name must be between 1 and 100 characters' })
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  date?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @Length(0, 100, { message: 'Venue must be less than 100 characters' })
  venue?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Length(0, 50, { message: 'City must be less than 50 characters' })
  city?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Length(0, 50, { message: 'Country must be less than 50 characters' })
  country?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Length(1, 50, { message: 'Promotion must be between 1 and 50 characters' })
  promotion?: string;

  @Field({ nullable: true })
  @IsOptional()
  posterUrl?: string;
}