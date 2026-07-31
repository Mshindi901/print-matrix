import sequelize from '../config/db-config.js';
import { DataTypes } from 'sequelize';

const Files = sequelize.define('files',{
    id:{
        type:DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey:true,
        allowNull:false
    },
    uploaded_by: {
        type:DataTypes.UUID,
        allowNull:false,
        references: {
            model: 'users',
            key: 'id'
        },
    },
    file_name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    file_url: {
        type:DataTypes.STRING,
        allowNull:false,
    },
    file_size:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    status:{
        type:DataTypes.ENUM('pending', 'completed'),
        defaultValue: 'pending',
        allowNull:false
    }
},{timestamps:true});

export default Files;