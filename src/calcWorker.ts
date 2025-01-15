import { parentPort, workerData } from 'worker_threads';
import { Position} from './position';
import { calculateAssetsValue } from './utils';


// TODO define calc result type
function processObjects(objects: Position[], prices: Map<string, number>): any[] {
    // TODO post message after each processed result ?
    return objects.map((obj) => calculateAssetsValue(obj, prices));
}


// Handle incoming data from the main thread (workerData)
const processedResults = processObjects(workerData.positions, workerData.prices);
// @ts-ignore
parentPort.postMessage(processedResults);
