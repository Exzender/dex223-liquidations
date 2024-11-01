import { parentPort, workerData } from 'worker_threads';
import { Asset, Position} from './position';

// sum all assets in USD
const calculateTotalInUSD = (assetsData: Position, pricesInUSD: Map<string, number>): number => {
    return assetsData.assets.reduce((total: number, asset: Asset) => {
        const price = pricesInUSD.get(asset.address) || 0;
        return total + (price * Number(asset.value));
    }, 0);
};

// convert price to base asset
const convertToBaseAsset = (
    totalInUSD: number,
    baseAssetPriceInUSD: number
): number => {
    return totalInUSD / (baseAssetPriceInUSD || 1);
};

// main calc function
export const calculateAssetsValue = (
    assetsData: Position,
    pricesInUSD: Map<string, number>
): { totalInUSD: number, totalInBaseAsset: number } => {
    // get base active
    const baseAssetPriceInUSD: number = pricesInUSD.get(assetsData.baseAsset) || 0;

    // sum all assets
    const totalInUSD = calculateTotalInUSD(assetsData, pricesInUSD);

    // convert sum to base asset
    const totalInBaseAsset = convertToBaseAsset(totalInUSD, baseAssetPriceInUSD);

    return { totalInUSD, totalInBaseAsset };
};

// TODO define calc result type
function processObjects(objects: Position[], prices: Map<string, number>): any[] {
    return objects.map((obj) => calculateAssetsValue(obj, prices));
}


// Handle incoming data from the main thread (workerData)
const processedResults = processObjects(workerData.positions, workerData.prices);
// @ts-ignore
parentPort.postMessage(processedResults);
