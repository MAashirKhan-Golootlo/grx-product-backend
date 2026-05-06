export default (): Record<string, unknown> => ({
  app: {
    name: process.env.APP_NAME ?? 'GRX Product Store Backend',
    version: process.env.APP_VERSION ?? '1.0.0',
    description:
      process.env.APP_DESCRIPTION ?? 'Feature-based NestJS boilerplate',
    port: Number(process.env.PORT ?? 3000),
    nodeEnv: process.env.NODE_ENV ?? 'development',
  },
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    name: process.env.DB_NAME ?? 'grx_productstore',
    ssl: process.env.DB_SSL === 'true',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? 'change-this-secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  },
});
