import express from "express";
import cors from 'cors';
import {apiRateLimiter} from './src/middleware/rate-limit.js';
import './src/config/association.js';

//admin routes
import adminRoutes from './src/admin/router.js'
//file routes
import fileRoutes from './src/files/routes.js';
//print jobs routes
import printJobRoutes from './src/print-jobs/router.js'
//printer routes
import printerRoutes from './src/printer/routes.js'
//user routes
import userRoutes from './src/users/routes.js';
//auth routes
import authRoutes from './src/auth/routes.js'
//Printer_Agent ROutes
import printerAgentRoutes from './src/printer-agent/router.js';



const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(apiRateLimiter);
app.set('trust proxy', 1);

app.use('/api', adminRoutes);
app.use('/api', authRoutes)
app.use('/api', fileRoutes);
app.use('/api', printJobRoutes);
app.use('/api', printerRoutes);
app.use('/api', userRoutes);
app.use('/api', printerAgentRoutes);

export default app;