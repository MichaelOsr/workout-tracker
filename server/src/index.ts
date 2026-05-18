import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
import {PrismaClient} from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { timeStamp } from 'node:console';

dotenv.config();

const app = express();

const adapter = new PrismaPg({connectionString:process.env.DATABASE_URL})
const prisma = new PrismaClient({adapter});
const PORT = process.env.PORT || 3000

app.use(cors());
app.use(express.json())

app.get('/api/health', async (req, res) => {
    try {
        const record = await prisma.healthCheck.create({
            data: {message:'API is healthy'}
        });

        const count = await prisma.healthCheck.count();

        res.json({
            status: 'ok',
            timeStamp: new Date().toISOString(),
            service: 'workout-tracer-api',
            database: {
                connected: true,
                lastRecord: record,
                totalRecords: count
            }
        });
    } catch (error) {
        res.status(500).json({
            status:'error',
            message: 'Database connection failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

//Gracefull Shutdown
process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
})

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
})