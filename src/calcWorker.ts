import { parentPort, workerData } from 'worker_threads';

type Asset = {
    name: string;
    quantity: number;
};

type AssetsData = {
    assets: Asset[];
    baseAssetName: string;
}

// Функция для суммирования общей стоимости активов в долларах США
const calculateTotalInUSD = (assetsData: AssetsData, pricesInUSD: Record<string, number>): number => {
    return assetsData.assets.reduce((total, asset) => {
        const price = pricesInUSD[asset.name];
        if (!price) throw new Error(`Цена актива ${asset.name} не найдена.`);
        return total + (price * asset.quantity);
    }, 0);
};

// Функция для пересчета суммы в базовом активе
const convertToBaseAsset = (
    totalInUSD: number,
    baseAssetPriceInUSD: number
): number => {
    if (baseAssetPriceInUSD === 0) throw new Error('Цена базового актива равна нулю.');
    return totalInUSD / baseAssetPriceInUSD;
};

// Основная функция
const calculateAssetsValue = (
    assetsData: AssetsData,
    pricesInUSD: Record<string, number>
): { totalInUSD: number, totalInBaseAsset: number } => {
    // Проверка наличия цены базового актива
    const baseAssetPriceInUSD = pricesInUSD[assetsData.baseAssetName];
    if (!baseAssetPriceInUSD) throw new Error(`Цена базового актива ${assetsData.baseAssetName} не найдена.`);

    // Суммируем стоимость всех активов в долларах США
    const totalInUSD = calculateTotalInUSD(assetsData, pricesInUSD);

    // Пересчитываем итоговую сумму в базовом активе
    const totalInBaseAsset = convertToBaseAsset(totalInUSD, baseAssetPriceInUSD);

    return { totalInUSD, totalInBaseAsset };
};

// Simulate long calculation on an object
function performHeavyCalculation(obj: any, prices: any[]): any {
    // Simulated long calculation process
    for (let i = 0; i < obj.assets.length; i++) {
        
    }
    let result = obj.param * 2; // Example calculation
    let shouldContinue = result < 100; // Decide if the object needs further processing
    return { id: obj.id, shouldContinue, result };
}

function processObjects(objects: any[], prices: any[]): any[] {
    return objects.map((obj) => performHeavyCalculation(obj, prices));
}


// Handle incoming data from the main thread (workerData)
const processedResults = processObjects(workerData, []);
// @ts-ignore
parentPort.postMessage(processedResults);
