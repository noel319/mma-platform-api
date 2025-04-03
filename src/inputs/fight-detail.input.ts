import { InputType, Field, ID, Int } from 'type-graphql';
import { IsNotEmpty, IsOptional, Min, IsUUID } from 'class-validator';

@InputType()
export class CreateFightDetailInput {
  @Field(() => ID)
  @IsNotEmpty({ message: 'Fight ID is required' })
  @IsUUID('4', { message: 'Fight ID must be a valid UUID' })
  fightId: string;

  @Field(() => ID)
  @IsNotEmpty({ message: 'Fighter ID is required' })
  @IsUUID('4', { message: 'Fighter ID must be a valid UUID' })
  fighterId: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0, { message: 'Strikes landed must be non-negative' })
  strikesLanded?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0, { message: 'Strikes attempted must be non-negative' })
  strikesAttempted?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0, { message: 'Significant strikes landed must be non-negative' })
  significantStrikesLanded?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0, { message: 'Significant strikes attempted must be non-negative' })
  significantStrikesAttempted?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0, { message: 'Takedowns landed must be non-negative' })
  takedownsLanded?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0, { message: 'Takedowns attempted must be non-negative' })
  takedownsAttempted?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0, { message: 'Submission attempts must be non-negative' })
  submissionAttempts?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0, { message: 'Reversals must be non-negative' })
  reversals?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0, { message: 'Control time seconds must be non-negative' })
  controlTimeSeconds?: number;
}

@InputType()
export class UpdateFightDetailInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0, { message: 'Strikes landed must be non-negative' })
  strikesLanded?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0, { message: 'Strikes attempted must be non-negative' })
  strikesAttempted?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0, { message: 'Significant strikes landed must be non-negative' })
  significantStrikesLanded?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0, { message: 'Significant strikes attempted must be non-negative' })
  significantStrikesAttempted?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0, { message: 'Takedowns landed must be non-negative' })
  takedownsLanded?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0, { message: 'Takedowns attempted must be non-negative' })
  takedownsAttempted?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0, { message: 'Submission attempts must be non-negative' })
  submissionAttempts?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0, { message: 'Reversals must be non-negative' })
  reversals?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0, { message: 'Control time seconds must be non-negative' })
  controlTimeSeconds?: number;
}