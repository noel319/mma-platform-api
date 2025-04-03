declare namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: 'development' | 'production' | 'test';
      PORT?: string;
      DB_HOST?: string;
      DB_PORT?: string;
      DB_USERNAME?: string;
      DB_PASSWORD?: string;
      DB_DATABASE?: string;
      DB_LOGGING?: string;
      JWT_SECRET?: string;
      JWT_EXPIRES_IN?: string;
    }
  }