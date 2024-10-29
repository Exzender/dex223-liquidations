import { Worker } from 'worker_threads'; // , isMainThread, parentPort, workerData                           
import { cpus } from 'os';

const numCPUs = cpus().length - 1; // Use all but one CPU core for workers
let results: any[] = [];

type ProcessedResult = {
    id: number;
    shouldContinue: boolean;
    result: any;
};

function createWorker(data: any): Promise<ProcessedResult[]> {
    return new Promise((resolvep, reject) => {
        const worker = new Worker('./dist/calcWorker.js', { workerData: data });

        worker.on('message', (result: ProcessedResult[]) => {
            resolvep(result);
        });

        worker.on('error', reject);

        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
}

export async function distributeTasks(objectsArray: any[]) {
    const chunkSize = Math.ceil(objectsArray.length / numCPUs);
    const tasks = [];

    let remainingObjects = [...objectsArray]; // Clone array for tracking objects

    for (let i = 0; i < numCPUs; i++) {
        const chunk = remainingObjects.splice(0, chunkSize);
        if (chunk.length > 0) {
            tasks.push(createWorker(chunk));
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
        await distributeTasks(remainingObjects);
    } else {
        console.log('All objects processed.');
    }
}

