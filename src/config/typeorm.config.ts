import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as config from 'config';

const {
  type,
  host = process.env.RDS_HOST,
  port = process.env.RDS_PORT,
  username = process.env.RDS_USERNAME,
  password = process.env.RDS_PASSWORD,
  database = process.env.RDS_DB_NAME,
  synchronize = process.env.TYPEORM_SYNC,
} = config.get('db');

export const typeOrmConfig: TypeOrmModuleOptions = {
  type,
  host,
  port,
  username,
  password,
  database,
  autoLoadEntities: true,
  synchronize,
};
