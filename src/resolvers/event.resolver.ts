import { Resolver, Query, Mutation, Arg, ID, Int, FieldResolver, Root } from 'type-graphql';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Event } from '../entities/event.entity';
import { Fight } from '../entities/fight.entity';
import { CreateEventInput, UpdateEventInput } from '../inputs/event.input';

@Resolver(Event)
export class EventResolver {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Fight)
    private fightRepository: Repository<Fight>,
  ) {}

  @Query(() => [Event])
  async events(
    @Arg('limit', () => Int, { defaultValue: 10 }) limit: number,
    @Arg('offset', () => Int, { defaultValue: 0 }) offset: number,
  ): Promise<Event[]> {
    return this.eventRepository.find({
      order: { date: 'DESC' },
      skip: offset,
      take: limit,
    });
  }

  @Query(() => [Event])
  async upcomingEvents(
    @Arg('limit', () => Int, { defaultValue: 10 }) limit: number,
  ): Promise<Event[]> {
    return this.eventRepository.find({
      where: {
        date: MoreThan(new Date()),
      },
      order: { date: 'ASC' },
      take: limit,
    });
  }

  @Query(() => [Event])
  async pastEvents(
    @Arg('limit', () => Int, { defaultValue: 10 }) limit: number,
    @Arg('offset', () => Int, { defaultValue: 0 }) offset: number,
  ): Promise<Event[]> {
    return this.eventRepository.find({
      where: {
        date: LessThan(new Date()),
      },
      order: { date: 'DESC' },
      skip: offset,
      take: limit,
    });
  }

  @Query(() => Event, { nullable: true })
  async event(@Arg('id', () => ID) id: string): Promise<Event | undefined> {
    return this.eventRepository.findOne({ where: { id } });
  }

  @Mutation(() => Event)
  async createEvent(
    @Arg('data') data: CreateEventInput,
  ): Promise<Event> {
    const event = this.eventRepository.create(data);
    return this.eventRepository.save(event);
  }

  @Mutation(() => Event)
  async updateEvent(
    @Arg('id', () => ID) id: string,
    @Arg('data') data: UpdateEventInput,
  ): Promise<Event> {
    await this.eventRepository.update(id, data);
    const updatedEvent = await this.eventRepository.findOne({ where: { id } });
    if (!updatedEvent) {
      throw new Error(`Event with ID ${id} not found`);
    }
    return updatedEvent;
  }

  @Mutation(() => Boolean)
  async deleteEvent(@Arg('id', () => ID) id: string): Promise<boolean> {
    const result = await this.eventRepository.delete(id);
    return result.affected !== undefined && result.affected > 0;
  }

  @FieldResolver(() => [Fight])
  async fights(@Root() event: Event): Promise<Fight[]> {
    return this.fightRepository.find({
      where: { eventId: event.id },
      order: { isMainEvent: 'DESC', isTitleFight: 'DESC' },
    });
  }
}
