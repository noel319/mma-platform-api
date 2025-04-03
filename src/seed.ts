import 'reflect-metadata';
import { createConnection, getRepository } from 'typeorm';
import { WeightClass } from './entities/weight-class.entity';
import { Fighter } from './entities/fighter.entity';
import { FighterStats } from './entities/fighter-stats.entity';
import { Event } from './entities/event.entity';
import config from './config';

async function seed() {
  try {
    // Create connection
    const connection = await createConnection({
      type: 'postgres',
      host: config.db.host,
      port: config.db.port,
      username: config.db.username,
      password: config.db.password,
      database: config.db.database,
      entities: [__dirname + '/entities/*.entity{.ts,.js}'],
      synchronize: true,
    });

    console.log('Connected to database');

    // Seed weight classes
    const weightClassRepository = connection.getRepository(WeightClass);
    const fighterRepository = connection.getRepository(Fighter);
    const fighterStatsRepository = connection.getRepository(FighterStats);
    const eventRepository = connection.getRepository(Event);

    // Check if weight classes already exist
    const existingWeightClasses = await weightClassRepository.find();
    if (existingWeightClasses.length === 0) {
      console.log('Seeding weight classes...');
      
      const weightClasses = [
        { name: 'Flyweight', minWeightKg: 0, maxWeightKg: 56.7 },
        { name: 'Bantamweight', minWeightKg: 56.7, maxWeightKg: 61.2 },
        { name: 'Featherweight', minWeightKg: 61.2, maxWeightKg: 65.8 },
        { name: 'Lightweight', minWeightKg: 65.8, maxWeightKg: 70.3 },
        { name: 'Welterweight', minWeightKg: 70.3, maxWeightKg: 77.1 },
        { name: 'Middleweight', minWeightKg: 77.1, maxWeightKg: 83.9 },
        { name: 'Light Heavyweight', minWeightKg: 83.9, maxWeightKg: 93.0 },
        { name: 'Heavyweight', minWeightKg: 93.0, maxWeightKg: 120.2 },
        { name: 'Women\'s Strawweight', minWeightKg: 0, maxWeightKg: 52.2 },
        { name: 'Women\'s Flyweight', minWeightKg: 52.2, maxWeightKg: 56.7 },
        { name: 'Women\'s Bantamweight', minWeightKg: 56.7, maxWeightKg: 61.2 },
        { name: 'Women\'s Featherweight', minWeightKg: 61.2, maxWeightKg: 65.8 },
      ];
      
      await weightClassRepository.save(weightClasses);
      console.log('Weight classes seeded successfully!');
    } else {
      console.log('Weight classes already exist, skipping seed');
    }

    // Add sample fighters
    const existingFighters = await fighterRepository.find();
    if (existingFighters.length === 0) {
      console.log('Seeding sample fighters...');
      
      const sampleFighters = [
        {
          firstName: 'Jon',
          lastName: 'Jones',
          nickname: 'Bones',
          dateOfBirth: new Date('1987-07-19'),
          heightCm: 193,
          weightKg: 93.0,
          reachCm: 215,
          nationality: 'USA',
          team: 'Jackson Wink MMA',
          profileImageUrl: 'https://example.com/jon-jones.jpg',
          isActive: true
        },
        {
          firstName: 'Israel',
          lastName: 'Adesanya',
          nickname: 'The Last Stylebender',
          dateOfBirth: new Date('1989-07-22'),
          heightCm: 193,
          weightKg: 83.9,
          reachCm: 203,
          nationality: 'Nigeria',
          team: 'City Kickboxing',
          profileImageUrl: 'https://example.com/israel-adesanya.jpg',
          isActive: true
        },
        {
          firstName: 'Amanda',
          lastName: 'Nunes',
          nickname: 'The Lioness',
          dateOfBirth: new Date('1988-05-30'),
          heightCm: 173,
          weightKg: 61.2,
          reachCm: 175,
          nationality: 'Brazil',
          team: 'American Top Team',
          profileImageUrl: 'https://example.com/amanda-nunes.jpg',
          isActive: true
        }
      ];
      
      // Save fighters
      for (const fighterData of sampleFighters) {
        const fighter = await fighterRepository.save(fighterData);
        
        // Create fighter stats
        await fighterStatsRepository.save({
          fighterId: fighter.id,
          wins: Math.floor(Math.random() * 20) + 10,
          losses: Math.floor(Math.random() * 5),
          draws: Math.floor(Math.random() * 2),
          noContests: 0,
          knockouts: Math.floor(Math.random() * 8),
          submissions: Math.floor(Math.random() * 6),
          decisionWins: Math.floor(Math.random() * 8)
        });
      }
      
      console.log('Sample fighters seeded successfully!');
    } else {
      console.log('Fighters already exist, skipping seed');
    }

    // Add sample events
    const existingEvents = await eventRepository.find();
    if (existingEvents.length === 0) {
      console.log('Seeding sample events...');
      
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 1);
      
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 1);
      
      const sampleEvents = [
        {
          name: 'UFC 300',
          date: futureDate,
          venue: 'T-Mobile Arena',
          city: 'Las Vegas',
          country: 'USA',
          promotion: 'UFC',
          posterUrl: 'https://example.com/ufc-300.jpg'
        },
        {
          name: 'UFC 299',
          date: pastDate,
          venue: 'Madison Square Garden',
          city: 'New York',
          country: 'USA',
          promotion: 'UFC',
          posterUrl: 'https://example.com/ufc-299.jpg'
        },
        {
          name: 'Bellator 300',
          date: futureDate,
          venue: 'SAP Center',
          city: 'San Jose',
          country: 'USA',
          promotion: 'Bellator',
          posterUrl: 'https://example.com/bellator-300.jpg'
        }
      ];
      
      await eventRepository.save(sampleEvents);
      console.log('Sample events seeded successfully!');
    } else {
      console.log('Events already exist, skipping seed');
    }

    console.log('Database seeded successfully!');
    
    // Close connection
    await connection.close();
    console.log('Connection closed');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seed function
seed();