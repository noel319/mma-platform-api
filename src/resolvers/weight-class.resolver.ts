import { Resolver, Query, Mutation, Arg, ID, Int } from 'type-graphql';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { WeightClass } from '../entities/weight-class.entity';
import { CreateWeightClassInput, UpdateWeightClassInput } from '../inputs/weight-class.input';

@Resolver(WeightClass)
export class WeightClassResolver {
  constructor(
    @InjectRepository(WeightClass)
    private weightClassRepository: Repository<WeightClass>,
  ) {}

  @Query(() => [WeightClass])
  async weightClasses(): Promise<WeightClass[]> {
    return this.weightClassRepository.find({
      order: { minWeightKg: 'ASC' }
    });
  }

  @Query(() => WeightClass, { nullable: true })
  async weightClass(@Arg('id', () => ID) id: string): Promise<WeightClass | undefined> {
    return this.weightClassRepository.findOne({ where: { id } });
  }

  @Mutation(() => WeightClass)
  async createWeightClass(
    @Arg('data') data: CreateWeightClassInput,
  ): Promise<WeightClass> {
    const weightClass = this.weightClassRepository.create(data);
    return this.weightClassRepository.save(weightClass);
  }

  @Mutation(() => WeightClass)
  async updateWeightClass(
    @Arg('id', () => ID) id: string,
    @Arg('data') data: UpdateWeightClassInput,
  ): Promise<WeightClass> {
    await this.weightClassRepository.update(id, data);
    const updatedWeightClass = await this.weightClassRepository.findOne({ where: { id } });
    if (!updatedWeightClass) {
      throw new Error(`Weight class with ID ${id} not found`);
    }
    return updatedWeightClass;
  }

  @Mutation(() => Boolean)
  async deleteWeightClass(@Arg('id', () => ID) id: string): Promise<boolean> {
    const result = await this.weightClassRepository.delete(id);
    return result.affected !== undefined && result.affected > 0;
  }
}