import { Resolver, Query, Mutation, Arg, ID, Int, FieldResolver, Root } from 'type-graphql';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Fight, ResultType } from '../entities/fight.entity';
import { Fighter } from '../entities/fighter.entity';
import { Event } from '../entities/event.entity';
import { WeightClass } from '../entities/weight-class.entity';
import { FightDetail } from '../entities/fight-detail.entity';
import { FighterStats } from '../entities/fighter-stats.entity';
import { Ranking } from '../entities/ranking.entity';
import { CreateFightInput, UpdateFightInput, RecordFightResultInput } from '../inputs/fight.input';
import { CreateFightDetailInput } from '../inputs/fight-detail.input';

@Resolver(Fight)
export class FightResolver {
  constructor(
    @InjectRepository(Fight)
    private fightRepository: Repository<Fight>,
    @InjectRepository(Fighter)
    private fighterRepository: Repository<Fighter>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(WeightClass)
    private weightClassRepository: Repository<WeightClass>,
    @InjectRepository(FightDetail)
    private fightDetailRepository: Repository<FightDetail>,
    @InjectRepository(FighterStats)
    private fighterStatsRepository: Repository<FighterStats>,
    @InjectRepository(Ranking)
    private rankingRepository: Repository<Ranking>,
  ) {}

  @Query(() => [Fight])
  async fights(
    @Arg('limit', () => Int, { defaultValue: 10 }) limit: number,
    @Arg('offset', () => Int, { defaultValue: 0 }) offset: number,
  ): Promise<Fight[]> {
    return this.fightRepository.find({
      skip: offset,
      take: limit,
      relations: ['event'],
      order: { 'event.date': 'DESC' },
    });
  }

  @Query(() => Fight, { nullable: true })
  async fight(@Arg('id', () => ID) id: string): Promise<Fight | undefined> {
    return this.fightRepository.findOne({ where: { id } });
  }

  @Query(() => [Fight])
  async fighterFights(
    @Arg('fighterId', () => ID) fighterId: string,
    @Arg('limit', () => Int, { defaultValue: 10 }) limit: number,
    @Arg('offset', () => Int, { defaultValue: 0 }) offset: number,
  ): Promise<Fight[]> {
    return this.fightRepository
      .createQueryBuilder('fight')
      .leftJoinAndSelect('fight.event', 'event')
      .where('fight.fighter1Id = :fighterId', { fighterId })
      .orWhere('fight.fighter2Id = :fighterId', { fighterId })
      .orderBy('event.date', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany();
  }

  @Mutation(() => Fight)
  async createFight(
    @Arg('data') data: CreateFightInput,
  ): Promise<Fight> {
    // Verify that fighters and weight class exist
    const fighter1 = await this.fighterRepository.findOne({ where: { id: data.fighter1Id } });
    if (!fighter1) {
      throw new Error(`Fighter with ID ${data.fighter1Id} not found`);
    }

    const fighter2 = await this.fighterRepository.findOne({ where: { id: data.fighter2Id } });
    if (!fighter2) {
      throw new Error(`Fighter with ID ${data.fighter2Id} not found`);
    }

    if (data.fighter1Id === data.fighter2Id) {
      throw new Error('A fighter cannot fight against themselves');
    }

    const weightClass = await this.weightClassRepository.findOne({ where: { id: data.weightClassId } });
    if (!weightClass) {
      throw new Error(`Weight class with ID ${data.weightClassId} not found`);
    }

    const event = await this.eventRepository.findOne({ where: { id: data.eventId } });
    if (!event) {
      throw new Error(`Event with ID ${data.eventId} not found`);
    }

    const fight = this.fightRepository.create(data);
    return this.fightRepository.save(fight);
  }

  @Mutation(() => Fight)
  async updateFight(
    @Arg('id', () => ID) id: string,
    @Arg('data') data: UpdateFightInput,
  ): Promise<Fight> {
    const fight = await this.fightRepository.findOne({ where: { id } });
    if (!fight) {
      throw new Error(`Fight with ID ${id} not found`);
    }

    await this.fightRepository.update(id, data);
    const updatedFight = await this.fightRepository.findOne({ where: { id } });
    return updatedFight!;
  }

  @Mutation(() => Fight)
  async recordFightResult(
    @Arg('id', () => ID) id: string,
    @Arg('data') data: RecordFightResultInput,
  ): Promise<Fight> {
    const fight = await this.fightRepository.findOne({ 
      where: { id },
      relations: ['fighter1', 'fighter2', 'weightClass'],
    });
    
    if (!fight) {
      throw new Error(`Fight with ID ${id} not found`);
    }

    // Make sure the winner is one of the fighters in the fight
    if (data.winnerId && data.winnerId !== fight.fighter1Id && data.winnerId !== fight.fighter2Id) {
      throw new Error('Winner must be one of the fighters in the fight');
    }

    // Update fight with result data
    Object.assign(fight, data);
    const updatedFight = await this.fightRepository.save(fight);

    // Update fighter stats based on fight result
    await this.updateFighterStats(fight, data.resultType, data.winnerId);

    // Update rankings based on fight result
    if (data.resultType && (data.resultType !== ResultType.NO_CONTEST) && fight.weightClass) {
      await this.updateRankings(fight, data.resultType, data.winnerId);
    }

    return updatedFight;
  }

  @Mutation(() => FightDetail)
  async addFightDetail(
    @Arg('data') data: CreateFightDetailInput,
  ): Promise<FightDetail> {
    const fight = await this.fightRepository.findOne({ 
      where: { id: data.fightId },
      relations: ['fighter1', 'fighter2']
    });
    
    if (!fight) {
      throw new Error(`Fight with ID ${data.fightId} not found`);
    }

    // Verify fighter is part of the fight
    if (data.fighterId !== fight.fighter1Id && data.fighterId !== fight.fighter2Id) {
      throw new Error('Fighter must be part of the fight');
    }

    // Verify fight detail doesn't already exist
    const existingDetail = await this.fightDetailRepository.findOne({
      where: { fightId: data.fightId, fighterId: data.fighterId }
    });

    if (existingDetail) {
      throw new Error('Fight detail already exists for this fighter in this fight');
    }

    // Create fight detail
    const fightDetail = this.fightDetailRepository.create(data);
    return this.fightDetailRepository.save(fightDetail);
  }

  @Mutation(() => Boolean)
  async deleteFight(@Arg('id', () => ID) id: string): Promise<boolean> {
    const result = await this.fightRepository.delete(id);
    return result.affected !== undefined && result.affected > 0;
  }

  @FieldResolver(() => Event)
  async event(@Root() fight: Fight): Promise<Event | undefined> {
    return this.eventRepository.findOne({ where: { id: fight.eventId } });
  }

  @FieldResolver(() => Fighter)
  async fighter1(@Root() fight: Fight): Promise<Fighter | undefined> {
    return this.fighterRepository.findOne({ where: { id: fight.fighter1Id } });
  }

  @FieldResolver(() => Fighter)
  async fighter2(@Root() fight: Fight): Promise<Fighter | undefined> {
    return this.fighterRepository.findOne({ where: { id: fight.fighter2Id } });
  }

  @FieldResolver(() => WeightClass)
  async weightClass(@Root() fight: Fight): Promise<WeightClass | undefined> {
    return this.weightClassRepository.findOne({ where: { id: fight.weightClassId } });
  }

  @FieldResolver(() => Fighter, { nullable: true })
  async winner(@Root() fight: Fight): Promise<Fighter | undefined | null> {
    if (!fight.winnerId) return null;
    return this.fighterRepository.findOne({ where: { id: fight.winnerId } });
  }

  @FieldResolver(() => [FightDetail])
  async details(@Root() fight: Fight): Promise<FightDetail[]> {
    return this.fightDetailRepository.find({ where: { fightId: fight.id } });
  }

  // Helper methods for updating fighter stats and rankings
  private async updateFighterStats(
    fight: Fight, 
    resultType: ResultType, 
    winnerId?: string
  ): Promise<void> {
    // Handle different result types to update fighter stats
    const fighter1Stats = await this.fighterStatsRepository.findOne({ where: { fighterId: fight.fighter1Id } });
    const fighter2Stats = await this.fighterStatsRepository.findOne({ where: { fighterId: fight.fighter2Id } });
    
    if (!fighter1Stats || !fighter2Stats) {
      throw new Error('Fighter stats not found');
    }
    
    // Update stats based on result type
    if (winnerId) {
      // There is a winner
      const winnerStats = winnerId === fight.fighter1Id ? fighter1Stats : fighter2Stats;
      const loserStats = winnerId === fight.fighter1Id ? fighter2Stats : fighter1Stats;
      
      // Update winner stats
      if (resultType === ResultType.KNOCKOUT || resultType === ResultType.TECHNICAL_KNOCKOUT) {
        winnerStats.wins += 1;
        winnerStats.knockouts += 1;
      } else if (resultType === ResultType.SUBMISSION) {
        winnerStats.wins += 1;
        winnerStats.submissions += 1;
      } else if (
        resultType === ResultType.DECISION_UNANIMOUS || 
        resultType === ResultType.DECISION_SPLIT || 
        resultType === ResultType.DECISION_MAJORITY
      ) {
        winnerStats.wins += 1;
        winnerStats.decisionWins += 1;
      } else if (resultType === ResultType.DISQUALIFICATION) {
        winnerStats.wins += 1;
      }
      
      // Update loser stats
      loserStats.losses += 1;
      
      await this.fighterStatsRepository.save(winnerStats);
      await this.fighterStatsRepository.save(loserStats);
    } else if (resultType === ResultType.DRAW) {
      // It's a draw
      fighter1Stats.draws += 1;
      fighter2Stats.draws += 1;
      
      await this.fighterStatsRepository.save(fighter1Stats);
      await this.fighterStatsRepository.save(fighter2Stats);
    } else if (resultType === ResultType.NO_CONTEST) {
      // No contest
      fighter1Stats.noContests += 1;
      fighter2Stats.noContests += 1;
      
      await this.fighterStatsRepository.save(fighter1Stats);
      await this.fighterStatsRepository.save(fighter2Stats);
    }
  }

  private async updateRankings(
    fight: Fight, 
    resultType: ResultType, 
    winnerId?: string
  ): Promise<void> {
    // Don't update rankings for no contest
    if (resultType === ResultType.NO_CONTEST) {
      return;
    }
    
    // Get current rankings for both fighters in the weight class
    const latestRankings = await this.rankingRepository
      .createQueryBuilder('ranking')
      .where('ranking.weightClassId = :weightClassId', { weightClassId: fight.weightClassId })
      .orderBy('ranking.updatedAt', 'DESC')
      .getMany();
    
    const latestTimestamp = latestRankings.length > 0 ? latestRankings[0].updatedAt : new Date();
    const rankingsByFighter = new Map<string, Ranking>();
    
    // Get the latest ranking for each fighter
    for (const ranking of latestRankings) {
      if (!rankingsByFighter.has(ranking.fighterId)) {
        rankingsByFighter.set(ranking.fighterId, ranking);
      }
    }
    
    // Get current rankings for both fighters
    const fighter1Ranking = rankingsByFighter.get(fight.fighter1Id);
    const fighter2Ranking = rankingsByFighter.get(fight.fighter2Id);
    
    // Calculate new rankings based on the fight result
    const now = new Date();
    
    if (resultType === ResultType.DRAW) {
      // No change in rankings for a draw
      return;
    }
    
    if (winnerId && (fighter1Ranking || fighter2Ranking)) {
      const winnerRanking = winnerId === fight.fighter1Id ? fighter1Ranking : fighter2Ranking;
      const loserRanking = winnerId === fight.fighter1Id ? fighter2Ranking : fighter1Ranking;
      
      // If winner is ranked lower (higher number) than loser, or winner is not ranked but loser is
      if (
        (winnerRanking && loserRanking && winnerRanking.position > loserRanking.position) ||
        (!winnerRanking && loserRanking)
      ) {
        // Winner takes loser's position, loser and everyone in between moves down one spot
        const newWinnerPosition = loserRanking ? loserRanking.position : 15; // Default to position 15 if no loser ranking
        
        // Create new rankings for everyone affected
        const newRankings: Ranking[] = [];
        
        // Create or update winner ranking
        if (winnerRanking) {
          // Winner already has a ranking
          newRankings.push(this.rankingRepository.create({
            fighterId: winnerId,
            weightClassId: fight.weightClassId,
            position: newWinnerPosition,
            points: winnerRanking.points + 25, // Add points for the win
            previousPosition: winnerRanking.position,
            updatedAt: now
          }));
        } else {
          // Winner has no previous ranking
          newRankings.push(this.rankingRepository.create({
            fighterId: winnerId,
            weightClassId: fight.weightClassId,
            position: newWinnerPosition,
            points: 25, // Initial points for the win
            previousPosition: null,
            updatedAt: now
          }));
        }
        
        // Move affected fighters down
        if (loserRanking) {
          for (const ranking of latestRankings) {
            // Skip the winner and fighters not affected
            if (
              ranking.fighterId === winnerId || 
              ranking.position < loserRanking.position || 
              ranking.position > (winnerRanking?.position || 999)
            ) {
              continue;
            }
            
            // Create new ranking with position moved down by 1
            newRankings.push(this.rankingRepository.create({
              fighterId: ranking.fighterId,
              weightClassId: fight.weightClassId,
              position: ranking.position + 1,
              points: ranking.points,
              previousPosition: ranking.position,
              updatedAt: now
            }));
          }
        }
        
        // Save all new rankings
        await this.rankingRepository.save(newRankings);
      } else if (winnerRanking && !loserRanking) {
        // Winner is ranked, loser is not - just update winner's points
        await this.rankingRepository.save(
          this.rankingRepository.create({
            fighterId: winnerId,
            weightClassId: fight.weightClassId,
            position: winnerRanking.position,
            points: winnerRanking.points + 10, // Add fewer points as expected win
            previousPosition: winnerRanking.position,
            updatedAt: now
          })
        );
      } else if (winnerRanking && loserRanking && winnerRanking.position < loserRanking.position) {
        // Winner already ranked higher than loser - just update points
        await this.rankingRepository.save(
          this.rankingRepository.create({
            fighterId: winnerId,
            weightClassId: fight.weightClassId,
            position: winnerRanking.position,
            points: winnerRanking.points + 10, // Add fewer points as expected win
            previousPosition: winnerRanking.position,
            updatedAt: now
          })
        );
      }
    }
  }
}