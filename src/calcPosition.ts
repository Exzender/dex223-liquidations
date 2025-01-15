import { Worker } from 'worker_threads'; // , isMainThread, parentPort, workerData                           
import { cpus } from 'os';
import { Position } from './position';

const numCPUs = cpus().length - 1; // Use all but one CPU core for workers
let results: any[] = [];

type ProcessedResult = {
    result: any;
};

function createWorker(positions: Position[], prices: Map<string, number>): Promise<ProcessedResult[]> {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./dist/calcWorker.js', { workerData: { positions, prices } });

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

    while (tasks.length > 0) {
        try {
            const result = await Promise.race(tasks);
            
            // TODO return result - emit event
            results.push(result);

            // remove finished task
            const index = tasks.findIndex(p => p === Promise.resolve(result));
            if (index !== -1) {
                tasks.splice(index, 1);
            }
        } catch (error) {
            console.error('Error occurred:', error);
            // remove error task
            const index = tasks.findIndex(p => p === Promise.reject(error));
            if (index !== -1) {
                tasks.splice(index, 1);
            }
        }
    }

    console.log('All tasks completed. Results:', results);
}

