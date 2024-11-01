import { PosDatabase } from './db';
import { Prices } from './prices';
import { ContractEventMonitor } from './txMonitoring';
import { createClient } from 'redis';
import { distributeTasks } from './calcPosition';
import { testPositions } from './const';
import { AssetChange, ContractPosition, Position, Asset } from './position';
import { calculateAssetsValue } from './calcWorker';

const PRICE_INTERVAL = 5000;
const RECALC_INTERVAL = 6000; // how often to call positions value check
const CHAIN = 'eth';

const AAVE_TOKEN = '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9';
const USDT_TOKEN = '0xdac17f958d2ee523a2206206994597c13d831ec7';

let db: PosDatabase;
let pricer: Prices;

const redisClient = createClient({
    url: 'redis://localhost:6379' // Adjust the URL to match your Redis server setup
});



async function pushToRedis(data: string): Promise<void> {
    await redisClient.lPush('liqQueue', data);        
}

// run by timer. get results from redis. remove processed. move back unprocessed
async function checkLiquidationResults() {
    
}

// function call of calcPosition with interval
async function iteratePositions() {
    const positions = db.getAllPositions();
    const prices = pricer.getAllPrices();
    await distributeTasks(positions, prices);
    setTimeout(iteratePositions, RECALC_INTERVAL);    
}

async function positionCreatedEvent(pos: ContractPosition): Promise<void> {
    console.log('got positionCreatedEvent');
    
    let assets: Asset[] = [];
    for (let i = 0; i < pos.assets.length; i++) {
        assets.push({
            address: pos.assets[i],
            value: pos.balances[i].toString()
        })
    }
    
    // process new position
    const position: Position = {
        id: pos.id.toString(),
        orderId: pos.orderId.toString(),
        owner: pos.owner,
        assets: assets,
        whitelistedTokens: pos.whitelistedTokens,
        whitelistedTokenList: pos.whitelistedTokenList,
        created: new Date(), // TODO get from event timestamp
        deadline: new Date(Number(pos.deadline * 1000n)),
        baseAsset: pos.baseAsset,
        initialBalance: pos.initialBalance.toString(),
        interest: Number(pos.interest),
        initialSum: 0
    }
    
    // calculate position sum/value 
    const prices = pricer.getAllPrices();
    const res = calculateAssetsValue(position, prices);
    position.initialSum = res.totalInBaseAsset;
    
    // TODO db has no unique index check?
    await db.addPosition(position);

    // TODO check results
    console.dir(db.getAllPositions());
}

async function assetAddedEvent(eventData: AssetChange): Promise<void> {
    console.log('got assetAddedEvent');
    // process updated positions
    const pos = db.findById(eventData.id.toString());
    // TODO if no position found - do what ? (ignore?  create position?)
    
    let foundAsset = false; 
    
    if (pos) {
        const assets = pos.assets;
        
        // const tempObject = {
        //     assets: pos.assets,
        //     balances: pos.balances
        // }
        
        // TODO maybe move to DB module
        if (pos.assets.length) {
            for (let i = 0; i < pos.assets.length; i++) {
            // for (let asset of assets) {
                const asset = pos.assets[i];
                if (asset.address === eventData.asset) {
                    foundAsset = true;
                    assets[i].value = (BigInt(assets[i].value) + eventData.value).toString();
                    break;
                }
            }
        }

        if (!foundAsset) {
            assets.push({
                address: eventData.asset,
                value: eventData.value.toString()
            });
            // tempObject.balances.push(eventData.value.toString());
        }

        await db.updatePosition(eventData.id.toString(), { assets });
    }

    // TODO check results
    console.dir(db.getAllPositions());
}

async function positionClosedEvent(id: bigint): Promise<void> {
    console.log('got positionClosedEvent');
    // TODO process updated positions
    await db.deletePosition(id.toString());

    // TODO check results
    console.dir(db.getAllPositions());
}

(async() => {
    await redisClient.connect();
    
    db = new PosDatabase('./data/db.json');

    // Initialize the database
    await db.initialize();
    
    const all = db.getAllPositions();
    
    if (all.length === 0) {
        // Add some test positions
        const date = new Date();
        const deadline = new Date();
        deadline.setDate(date.getDate() + 30);
        
        for (let pos of testPositions) {
            pos.created = date;
            pos.deadline = deadline;
            await db.addPosition(pos);
        }
    }

    // test contract events monitoring
    const eventMonitor = new ContractEventMonitor(USDT_TOKEN);
    eventMonitor.on('PositionCreated', positionCreatedEvent);
    eventMonitor.on('AssetAdded', assetAddedEvent);
    eventMonitor.on('PositionClosed', positionClosedEvent);
                                             
    // start prices updater
    pricer = new Prices(PRICE_INTERVAL, CHAIN);
    await pricer.addAddress(AAVE_TOKEN, true); // AAVE token
    
    // Query positions
    console.log('All Positions:', db.getAllPositions());
    const pos = db.findById('b9e9a77b-e489-4263-9925-a606d60c8dad'); 
    // console.log('Position with ID:', pos);
    // console.log(`Position with Owner ${pos?.owner}:`, db.findByOwner(pos?.owner || ''));
    // console.log('Position with order ID = 1:', db.findByOrderId('1'));
    
    console.log('AAVE price: ', pricer.getTokenPrice(AAVE_TOKEN));
    console.log('Token price: ', pricer.getTokenPrice('0xfff9976782d46cc05630d1f6ebab18b2324d6b14'));

    // tasks calculation
    setTimeout(iteratePositions, 1000);
    
    // test sending position to liquidation
    await pushToRedis('hi there');

    // finish background tasks
    await redisClient.disconnect();
    pricer.stopUpdates();
    eventMonitor.stopMonitoring();
})();