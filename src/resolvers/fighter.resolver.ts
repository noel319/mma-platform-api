import { Resolver, Query, Mutation, Arg, ID, Int, FieldResolver, Root } from 'type-graphql';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Fighter } from '../entities/fighter.entity';
import { FighterStats } from '../entities/fighter-stats.entity';
import { Fight } from '../entities/fight.entity';
import { Ranking } from '../entities/ranking.entity';
import { CreateFighterInput, UpdateFighterInput } from '../inputs/fighter.input';

@Resolver(Fighter)
export class FighterResolver {
  constructor(
    @InjectRepository(Fighter)
    private fighterRepository: Repository<Fighter>,
    @InjectRepository(FighterStats)
    private fighterStatsRepository: Repository<FighterStats>,
    @InjectRepository(Fight)
    private fightRepository: Repository<Fight>,
    @InjectRepository(Ranking)
    private rankingRepository: Repository<Ranking>,
  ) {}

  @Query(() => [Fighter])
  async fighters(): Promise<Fighter[]> {
    return this.fighterRepository.find();
  }

  @Query(() => Fighter, { nullable: true })
  async fighter(@Arg('id', () => ID) id: string): Promise<Fighter | undefined> {
    return this.fighterRepository.findOne({ where: { id } });
  }

  @Query(() => [Fighter])
  async searchFighters(
    @Arg('searchTerm') searchTerm: string,
    @Arg('limit', () => Int, { defaultValue: 10 }) limit: number,
  ): Promise<Fighter[]> {
    return this.fighterRepository
      .createQueryBuilder('fighter')
      .where('fighter.firstName ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orWhere('fighter.lastName ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orWhere('fighter.nickname ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .limit(limit)
      .getMany();
  }

  @Mutation(() => Fighter)
  async createFighter(
    @Arg('data') data: CreateFighterInput,
  ): Promise<Fighter> {
    const fighter = this.fighterRepository.create(data);
    const savedFighter = await this.fighterRepository.save(fighter);
    
    // Create initial fighter stats
    await this.fighterStatsRepository.save({
      fighterId: savedFighter.id,
      wins: 0,
      losses: 0,
      draws: 0,
      noContests: 0,
      knockouts: 0,
      submissions: 0,
      decisionWins: 0
    });
    
    return savedFighter;
  }

  @Mutation(() => Fighter)
  async updateFighter(
    @Arg('id', () => ID) id: string,
    @Arg('data') data: UpdateFighterInput,
  ): Promise<Fighter> {
    await this.fighterRepository.update(id, data);
    const updatedFighter = await this.fighterRepository.findOne({ where: { id } });
    if (!updatedFighter) {
      throw new Error(`Fighter with ID ${id} not found`);
    }
    return updatedFighter;
  }

  @Mutation(() => Boolean)
  async deleteFighter(@Arg('id', () => ID) id: string): Promise<boolean> {
    const result = await this.fighterRepository.delete(id);
    return result.affected !== undefined && result.affected > 0;
  }

  @FieldResolver()
  async stats(@Root() fighter: Fighter): Promise<FighterStats | null> {
    return this.fighterStatsRepository.findOne({ where: { fighterId: fighter.id } });
  }

  @FieldResolver(() => [Fight])
  async fights(@Root() fighter: Fighter): Promise<Fight[]> {
    return this.fightRepository
      .createQueryBuilder('fight')
      .where('fight.fighter1Id = :id', { id: fighter.id })
      .orWhere('fight.fighter2Id = :id', { id: fighter.id })
      .orderBy('fight.date', 'DESC')
      .getMany();
  }

  @FieldResolver(() => [Ranking])
  async currentRankings(@Root() fighter: Fighter): Promise<Ranking[]> {
    // Get latest rankings for the fighter across all weight classes
    const latestRankings: Ranking[] = [];
    
    // Find all weight classes the fighter has been ranked in
    const rankingsByWeightClass = await this.rankingRepository
      .createQueryBuilder('ranking')
      .where('ranking.fighterId = :fighterId', { fighterId: fighter.id })
      .select('DISTINCT ranking.weightClassId')
      .getRawMany();
    
    // For each weight class, find the latest ranking
    for (const { weightClassId } of rankingsByWeightClass) {
      const latestRanking = await this.rankingRepository
        .createQueryBuilder('ranking')
        .where('ranking.fighterId = :fighterId', { fighterId: fighter.id })
        .andWhere('ranking.weightClassId = :weightClassId', { weightClassId })
        .orderBy('ranking.updatedAt', 'DESC')
        .limit(1)
        .getOne();
      
      if (latestRanking) {
        latestRankings.push(latestRanking);
      }
    }
    
    return latestRankings;
  }
}