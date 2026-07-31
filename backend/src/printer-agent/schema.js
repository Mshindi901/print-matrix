import sequelize from '../config/db-config.js';
import { DataTypes } from 'sequelize';

const Print_Agent  = sequelize.define('printer_agents', {
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true,
        allowNull:false
    },
    location:{
        type:DataTypes.STRING,
        unique:true,
        allowNull:false
    },
    api_key:{
        type:DataTypes.STRING,
        allowNull:false
    },
    status:{
        type:DataTypes.ENUM('printing', 'completed', 'pending'),
        defaultValue:'pending',
        allowNull: false
    }
}, {timestamps:true});

export default Print_Agent;