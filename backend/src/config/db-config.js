import Sequelize from "sequelize";

const sequelize = new Sequelize('printer','postgres', 'yugah5002@', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false
});

export default sequelize;