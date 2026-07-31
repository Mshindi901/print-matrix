import Files from "../files/schema.js";
import User from "../auth/user-schema.js";
import Printers from "../printer/schema.js";
import PrintJobs from '../print-jobs/schema.js';
import { Op } from 'sequelize';

export const getDashboardStatistics = async (_req, res) => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const [totalUsers, activeUsers, totalPrinters, activePrinters, totalPrintJobs, jobsToday, jobsInQueue, totalPagesPrinted] = await Promise.all([
            User.count(),
            User.count({ where: { is_active: true } }),
            Printers.count(),
            Printers.count({ where: { status: 'online' } }),
            PrintJobs.count(),
            PrintJobs.count({ where: { createdAt: { [Op.gte]: startOfToday } } }),
            PrintJobs.count({ where: { status: ['pending', 'downloading', 'printing'] } }),
            PrintJobs.sum('copies'),
        ]);
        const completedJobs = await PrintJobs.count({ where: { status: 'completed' } });
        const successRate = totalPrintJobs ? `${((completedJobs / totalPrintJobs) * 100).toFixed(1)}%` : '0%';
        return res.status(200).json({ success: true, statistics: {
            totalUsers, activeUsers, totalPrinters, activePrinters, totalPrintJobs, jobsToday, jobsInQueue,
            averagePrintTime: '—', successRate, totalPagesPrinted: totalPagesPrinted || 0,
        } });
    } catch (error) {
        console.error('Fetching dashboard statistics failed:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getAllUsers = async(req, res) => {
    try {
        const all_users = await User.findAll();
        if(!all_users || all_users.length === 0){
            return res.status(400).json({success:false, message:'Failed to fetch'})
        };
        return res.status(200).json({success:true,message:'Fetched all user records', data:all_users})
    } catch (error) {
        return res.status(500).json({success:false,message:'Internal Server error',error:error});
    }
};

export const getAllFiles = async(req, res) => {
    try {
        const all_files = await Files.findAll();
        if(!all_files || all_files.length === 0){
            return res.status(400).json({success:false, message:'Failed to fetch'})
        };
        return res.status(200).json({success:true,message:'Fetched all files records', data:all_files})
    } catch (error) {
        return res.status(500).json({success:false,message:'Internal Server error',error:error});
    }
};

export const getAllPrinters = async(req, res) => {
    try {
        const all_printers = await Printers.findAll();
        if(!all_printers || all_printers.length === 0){
            return res.status(400).json({success:false, message:'Failed to fetch'})
        };
        return res.status(200).json({success:true,message:'Fetched all Printer records', data:all_printers})
    } catch (error) {
        return res.status(500).json({success:false,message:'Internal Server error',error:error});
    }
};
