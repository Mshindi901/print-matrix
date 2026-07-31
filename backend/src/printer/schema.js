import sequelize from '../config/db-config.js'
import { DataTypes } from 'sequelize';

const Printers = sequelize.define('printers', {
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true,
        allowNull:false
    },
    agent_id: {
        type:DataTypes.UUID,
        referencesL: {
            model: 'printer_agents',
            key:'id'
        },
        allowNull:false
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    location:{
        type:DataTypes.STRING,
        allowNull:false
    },
    status:{
        type:DataTypes.ENUM('online','offline'),
        defaultValue:'online',
        allowNull:false
    },
    ip_address:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    is_default:{
        type:DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull:false
    }
}, {timestamps:true});

export default Printers