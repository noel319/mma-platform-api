import { InputType, Field, Int, Float } from 'type-graphql';
import { IsNotEmpty, IsOptional, Min, Max, IsDate, Length } from 'class-validator';

@InputType()
export class CreateFighterInput {
  @Field()
  @IsNotEmpty({ message: 'First name is required' })
  @Length(1, 50, { message: 'First name must be between 1 and 50 characters' })
  firstName: string;

  @Field()
  @IsNotEmpty({ message: 'Last name is required' })
  @Length(1, 50, { message: 'Last name must be between 1 and 50 characters' })
  lastName: string;

  @Field({ nullable: true })
  @IsOptional()
  @Length(0, 50, { message: 'Nickname must be less than 50 characters' })
  nickname?: string;

  @Field({ nullable: true })
  @IsOptional()
  dateOfBirth?: Date;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0, { message: 'Height must be positive' })
  heightCm?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0, { message: 'Weight must be positive' })
  weightKg?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0, { message: 'Reach must be positive' })
  reachCm?: number;

  @Field({ nullable: true })
  @IsOptional()
  nationality?: string;

  @Field({ nullable: true })
  @IsOptional()
  team?: string;

  @Field({ nullable: true })
  @IsOptional()
  profileImageUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  isActive?: boolean;
}

@InputType()
export class UpdateFighterInput {
  @Field({ nullable: true })
  @IsOptional()
  @Length(1, 50, { message: 'First name must be between 1 and 50 characters' })
  firstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Length(1, 50, { message: 'Last name must be between 1 and 50 characters' })
  lastName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Length(0, 50, { message: 'Nickname must be less than 50 characters' })
  nickname?: string;

  @Field({ nullable: true })
  @IsOptional()
  dateOfBirth?: Date;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0, { message: 'Height must be positive' })
  heightCm?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0, { message: 'Weight must be positive' })
  weightKg?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0, { message: 'Reach must be positive' })
  reachCm?: number;

  @Field({ nullable: true })
  @IsOptional()
  nationality?: string;

  @Field({ nullable: true })
  @IsOptional()
  team?: string;

  @Field({ nullable: true })
  @IsOptional()
  profileImageUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  isActive?: boolean;
}