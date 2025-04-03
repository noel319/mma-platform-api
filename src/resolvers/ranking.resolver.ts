import { Resolver, Query, Arg, ID, Int } from 'type-graphql';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Ranking } from '../entities/ranking.entity';
import { WeightClass } from '../entities/weight-class.entity';

@Resolver(Ranking)
export class RankingResolver {
  constructor(
    @InjectRepository(Ranking)
    private rankingRepository: Repository<Ranking>,
    @InjectRepository(WeightClass)
    private weightClassRepository: Repository<WeightClass>,
  ) {}

  @Query(() => [Ranking])
  async rankings(
    @Arg('weightClassId', () => ID, { nullable: true }) weightClassId: string,
    @Arg('limit', () => Int, { defaultValue: 15 }) limit: number,
  ): Promise<Ranking[]> {
    const query = this.rankingRepository.createQueryBuilder('ranking')
      .orderBy('ranking.updatedAt', 'DESC')
      .addOrderBy('ranking.position', 'ASC')
      .take(limit);
    
    if (weightClassId) {
      query.where('ranking.weightClassId = :weightClassId', { weightClassId });
    }
    
    return query.getMany();
  }

  @Query(() => [Ranking])
  async currentRankingsByWeightClass(
    @Arg('weightClassId', () => ID) weightClassId: string,
    @Arg('limit', () => Int, { defaultValue: 15 }) limit: number,
  ): Promise<Ranking[]> {
    // Check if weight class exists
    const weightClass = await this.weightClassRepository.findOne({ where: { id: weightClassId } });
    if (!weightClass) {
      throw new Error(`Weight class with ID ${weightClassId} not found`);
    }
    
    // Get the latest rankings timestamp for this weight class
    const latestRankingDate = await this.rankingRepository
      .createQueryBuilder('ranking')
      .where('ranking.weightClassId = :weightClassId', { weightClassId })
      .select('MAX(ranking.updatedAt)', 'latestDate')
      .getRawOne();
    
    if (!latestRankingDate || !latestRankingDate.latestDate) {
      return [];
    }
    
    // Get all rankings for this timestamp
    return this.rankingRepository
      .createQueryBuilder('ranking')
      .where('ranking.weightClassId = :weightClassId', { weightClassId })
      .andWhere('ranking.updatedAt = :updatedAt', { updatedAt: latestRankingDate.latestDate })
      .orderBy('ranking.position', 'ASC')
      .take(limit)
      .getMany();
  }
}