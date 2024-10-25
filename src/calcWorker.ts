import { parentPort, workerData } from 'worker_threads';

// Simulate long calculation on an object
function performHeavyCalculation(obj: any): any {
    // Simulated long calculation process
    let result = obj.param * 2; // Example calculation
    let shouldContinue = result < 100; // Decide if the object needs further processing
    return { id: obj.id, shouldContinue, result };
}

function processObjects(objects: any[]): any[] {
    return objects.map((obj) => performHeavyCalculation(obj));
}

// Handle incoming data from the main thread (workerData)
const processedResults = processObjects(workerData);
// @ts-ignore
parentPort.postMessage(processedResults);
