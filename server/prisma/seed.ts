import { PrismaClient } from "../src/generated/prisma/client";
import * as fs from 'fs';
import * as path from 'path';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({connectionString:process.env.DATABASE_URL})
const prisma = new PrismaClient({adapter});

interface SourceExercise {
    id:string;
    name:string;
    force?:string|null;
    level?:string;
    mechanic?:string|null;
    equipment?:string|null;
    primaryMuscles:string[];
    secondaryMuscles:string[];
    instructions:string[];
    category:string;
}

async function main() {
    console.log('🌱 Starting seed...');

    //Load source Data
    const exercisesPath = path.join(__dirname,'data','exercises.json')
    const selectedPath = path.join(__dirname,'data','selected-exercises.json')

    const allExercises: SourceExercise[] = JSON.parse(
        fs.readFileSync(exercisesPath, 'utf-8')
    );
    const selectedNames: string[] = JSON.parse(
        fs.readFileSync(selectedPath, 'utf-8')
    );

    console.log(`📚 Source: ${allExercises.length} exercises`);
    console.log(`🎯 Selected: ${selectedNames.length} exercises`);

    const selected = allExercises.filter(ex => selectedNames.includes(ex.name));

    console.log(`✅ Found: ${selected.length} matches`);

    if (selected.length < selectedNames.length) {
        const found = selected.map(e => e.name);
        const missing = selectedNames.filter(n => !found.includes(n));
        console.log(`⚠️  Missing (not in source):`, missing);
    }

    await prisma.exercise.deleteMany({});
    console.log('🗑️  Cleared existing exercises');

    let inserted = 0;
    for (const ex of selected) {
        await prisma.exercise.create({
            data: {
                name: ex.name,
                primaryMuscle: ex.primaryMuscles[0] || 'unknown',
                secondaryMuscles: ex.secondaryMuscles || [],
                category: ex.mechanic === 'compound' ? 'compound' : 'isolation',
                equipment: ex.equipment ? [ex.equipment] : ['bodyweight'],
                instructions: ex.instructions.join(' ')
            },
        });
        inserted++;
    }
    console.log(`✨ Seeded ${inserted} exercises successfully`);
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
