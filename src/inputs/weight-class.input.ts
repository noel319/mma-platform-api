import { InputType, Field, Float } from 'type-graphql';
import { IsNotEmpty, Min, Max } from 'class-validator';

@InputType()
export class CreateWeightClassInput {
  @Field()
  @IsNotEmpty({ message: 'Weight class name is required' })
  name: string;

  @Field(() => Float)
  @IsNotEmpty({ message: 'Minimum weight is required' })
  @Min(0, { message: 'Minimum weight must be positive' })
  minWeightKg: number;

  @Field(() => Float)
  @IsNotEmpty({ message: 'Maximum weight is required' })
  @Min(0, { message: 'Maximum weight must be positive' })
  maxWeightKg: number;
}

@InputType()
export class UpdateWeightClassInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => Float, { nullable: true })
  @Min(0, { message: 'Minimum weight must be positive' })
  minWeightKg?: number;

  @Field(() => Float, { nullable: true })
  @Min(0, { message: 'Maximum weight must be positive' })
  maxWeightKg?: number;
}