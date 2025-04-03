import { InputType, Field, ID, Int } from 'type-graphql';
import { IsNotEmpty, IsOptional, Min, Max, IsBoolean, IsEnum, IsUUID } from 'class-validator';
import { ResultType } from '../entities/fight.entity';

@InputType()
export class CreateFightInput {
  @Field(() => ID)
  @IsNotEmpty({ message: 'Event ID is required' })
  @IsUUID('4', { message: 'Event ID must be a valid UUID' })
  eventId: string;

  @Field(() => ID)
  @IsNotEmpty({ message: 'Fighter 1 ID is required' })
  @IsUUID('4', { message: 'Fighter 1 ID must be a valid UUID' })
  fighter1Id: string;

  @Field(() => ID)
  @IsNotEmpty({ message: 'Fighter 2 ID is required' })
  @IsUUID('4', { message: 'Fighter 2 ID must be a valid UUID' })
  fighter2Id: string;

  @Field(() => ID)
  @IsNotEmpty({ message: 'Weight class ID is required' })
  @IsUUID('4', { message: 'Weight class ID must be a valid UUID' })
  weightClassId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isTitleFight?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isMainEvent?: boolean;

  @Field(() => Int)
  @IsNotEmpty({ message: 'Scheduled rounds is required' })
  @Min(1, { message: 'Scheduled rounds must be at least 1' })
  @Max(5, { message: 'Scheduled rounds must be at most 5' })
  scheduledRounds: number;
}

@InputType()
export class UpdateFightInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'Event ID must be a valid UUID' })
  eventId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'Fighter 1 ID must be a valid UUID' })
  fighter1Id?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'Fighter 2 ID must be a valid UUID' })
  fighter2Id?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'Weight class ID must be a valid UUID' })
  weightClassId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isTitleFight?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isMainEvent?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(1, { message: 'Scheduled rounds must be at least 1' })
  @Max(5, { message: 'Scheduled rounds must be at most 5' })
  scheduledRounds?: number;
}

@InputType()
export class RecordFightResultInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Result type is required' })
  @IsEnum(ResultType, { message: 'Invalid result type' })
  resultType: ResultType;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(1, { message: 'Actual rounds must be at least 1' })
  @Max(5, { message: 'Actual rounds must be at most 5' })
  actualRounds?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'Winner ID must be a valid UUID' })
  winnerId?: string;

  @Field({ nullable: true })
  @IsOptional()
  finishTime?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(1, { message: 'Finish round must be at least 1' })
  @Max(5, { message: 'Finish round must be at most 5' })
  finishRound?: number;
}