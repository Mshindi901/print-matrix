import sequelize from "./db-config.js";

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database Connected');
        await sequelize.sync();
        console.log('Database Synchronized successfully')
    } catch (error) {
        console.error(`Error with connecting database ${error}`);
        return null;
    }
};

export default connectDB;