import sequelize from "../config/db-config.js";
import { DataTypes } from "sequelize";

const PrintJobs = sequelize.define('print-jobs', {
    id:{
        type:DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey:true,
        allowNull:false
    },
    user_id:{
        type:DataTypes.UUID,
        references:{
            model:"users",
            key:'id'
        },
        allowNull:false
    },
    printer_id:{
        type:DataTypes.UUID,
        references:{
            model:'printers',
            key:'id'
        }
    },
    file_id:{
        type:DataTypes.UUID,
        references:{
            model:'files',
            key:'id'
        }
    },
    copies:{
        type:DataTypes.INTEGER,
        allowNull:false,
    },
    page_range:{
        type:DataTypes.STRING,
        allowNull:true
    },
    status:{
        type:DataTypes.ENUM('pending', 'downloading', 'printing', 'completed', 'failed'),
        defaultValue: 'pending',
        allowNull:false
    },
    submiited_at:{
        type:DataTypes.DATE,
        allowNull:false
    }
}, {timestamps:true});

export default PrintJobs;