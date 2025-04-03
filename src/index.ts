import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { buildSchema } from 'type-graphql';
import { createConnection, useContainer } from 'typeorm';
import { Container } from 'typedi';
import { WeightClassResolver } from './resolvers/weight-class.resolver';
import { FighterResolver } from './resolvers/fighter.resolver';
import { EventResolver } from './resolvers/event.resolver';
import { FightResolver } from './resolvers/fight.resolver';
import { RankingResolver } from './resolvers/ranking.resolver';
import config from './config';

// Register TypeDI container
useContainer(Container);

async function bootstrap() {
  try {
    // Create TypeORM connection
    const connection = await createConnection({
      type: 'postgres',
      host: config.db.host,
      port: config.db.port,
      username: config.db.username,
      password: config.db.password,
      database: config.db.database,
      entities: [__dirname + '/entities/*.entity{.ts,.js}'],
      synchronize: config.env !== 'production', // Synchronize only in non-production
      logging: config.db.logging,
    });

    console.log('Connected to PostgreSQL database');

    // Build GraphQL schema
    const schema = await buildSchema({
      resolvers: [
        WeightClassResolver,
        FighterResolver,
        EventResolver,
        FightResolver,
        RankingResolver,
      ],
      container: Container,
      validate: true,
    });

    // Create Express app
    const app = express();

    // Create Apollo Server
    const server = new ApolloServer({
      schema,
      context: ({ req, res }) => ({ req, res }),
      introspection: true,
      playground: config.env !== 'production',
    });

    // Apply middleware
    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });

    // Start the server
    app.listen(config.port, () => {
      console.log(`Server is running on http://localhost:${config.port}${server.graphqlPath}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
}

// Start the application
bootstrap();