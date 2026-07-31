import Sequelize from "sequelize";

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
    })
  : new Sequelize(
      process.env.DB_NAME || 'printer',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'yugah5002@',
      {
        host: process.env.DB_HOST || 'postgres-db',
        port: Number(process.env.DB_PORT) || 5432,
        dialect: 'postgres',
        logging: false,
      }
    );

export default sequelize;