import {Asset, Position} from "./position";

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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