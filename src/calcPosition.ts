import { Worker } from 'worker_threads'; // , isMainThread, parentPort, workerData                           
import { cpus } from 'os';
import { Position } from './position';

const numCPUs = cpus().length - 1; // Use all but one CPU core for workers
let results: any[] = [];

type ProcessedResult = {
    id: string;
    shouldContinue: boolean;
    result: any;
};

function createWorker(data: Position[], prices: Map<string, number>): Promise<ProcessedResult[]> {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./dist/calcWorker.js', { workerData: { data, prices } });

        worker.on('message', (result: ProcessedResult[]) => {
            resolve(result);
        });

        worker.on('error', reject);

        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
}

export async function distributeTasks(objectsArray: Position[], prices: Map<string, number>): Promise<void> {
    const chunkSize = Math.ceil(objectsArray.length / numCPUs);
    const tasks = [];

    let remainingObjects = [...objectsArray]; // Clone array for tracking objects

    for (let i = 0; i < numCPUs; i++) {
        const chunk = remainingObjects.splice(0, chunkSize);
        if (chunk.length > 0) {
            tasks.push(createWorker(chunk, prices));
        }
    }

    // Wait for all workers to return their results
    const allResults = await Promise.all(tasks);

    for (const result of allResults) {
        result.forEach((res: ProcessedResult) => {
            if (!res.shouldContinue) {
                // Remove object based on the condition returned by worker
                remainingObjects = remainingObjects.filter(obj => obj.id !== res.id);
            }
            results.push(res.result);
        });
    }

    console.log('All tasks completed. Results:', results);

    // Decide if we need to rerun another calculation cycle
    if (remainingObjects.length > 0) {
        console.log('Some objects need further processing.');
        await distributeTasks(remainingObjects, prices);
    } else {
        console.log('All objects processed.');
    }
}

