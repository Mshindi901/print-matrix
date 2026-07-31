import User from "../auth/user-schema.js";
import PrintJobs from "../print-jobs/schema.js";
import Printers from "../printer/schema.js";
import Print_Agent from "../printer-agent/schema.js";


User.hasMany(PrintJobs, {
    foreignKey: 'user_id',
    as: 'jobs'
});

PrintJobs.belongsTo(User, {
    foreignKey:'user_id',
    as: 'user'
});

Print_Agent.hasMany(Printers, {
    foreignKey: 'agent_id',
    as: 'printers'
});

Printers.belongsTo(Print_Agent, {
    foreignKey:'agent_id',
    as:'agent'
});

Printers.hasMany(PrintJobs, {
    foreignKey: 'printer_id',
    as:'jobs'
});
PrintJobs.belongsTo(Printers, {
    foreignKey:'printer_id',
    as:'printer'
})