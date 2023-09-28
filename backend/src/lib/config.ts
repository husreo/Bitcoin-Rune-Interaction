import { cleanEnv, num, str } from "envalid";
import { configDotenv } from "dotenv";

configDotenv();

const config = cleanEnv(process.env, {
  REDIS_HOST: str({ default: "localhost" }),
  REDIS_PORT: num({ default: 6379 }),
  DATABASE_URL: str(),
  MEMPOOL_BASE_URL: str({ default: "https://mempool.space/api" }),
});
const redisConfig = { host: config.REDIS_HOST, port: config.REDIS_PORT };

export { config, redisConfig };
