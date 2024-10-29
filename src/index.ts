import { PosDatabase } from './db';
import { Prices } from './prices';
import { ContractEventMonitor } from './txMonitoring';
import { createClient } from 'redis';
import { distributeTasks } from './calcPosition';
import { testPositions } from './const';
import { AssetChange, ContractPosition, Position } from './position';

const PRICE_INTERVAL = 5000;
const CHAIN = 'eth';

const AAVE_TOKEN = '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9';
const USDT_TOKEN = '0xdac17f958d2ee523a2206206994597c13d831ec7';

let db: PosDatabase;

const redisClient = createClient({
    url: 'redis://localhost:6379' // Adjust the URL to match your Redis server setup
});

async function pushToRedis(data: string): Promise<void> {
    await redisClient.lPush('liqQueue', data);        
}

// run by timer. get results from redis. remove processed. move back unprocessed
async function checkLiquidationResults() {
    
}

async function positionCreatedEvent(pos: ContractPosition): Promise<void> {
    console.log('got positionCreatedEvent');
    
    // process new position
    const position: Position = {
        id: pos.id.toString(),
        orderId: pos.orderId.toString(),
        owner: pos.owner,
        assets: pos.assets,
        balances: pos.balances.map((val) => val.toString()),
        whitelistedTokens: pos.whitelistedTokens,
        whitelistedTokenList: pos.whitelistedTokenList,
        created: new Date(), // TODO get from event timestamp
        deadline: new Date(Number(pos.deadline * 1000n)),
        baseAsset: pos.baseAsset,
        initialBalance: pos.initialBalance.toString(),
        interest: Number(pos.interest)
    }
    
    // TODO calculate position sum/value 
    
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
        const tempObject = {
            assets: pos.assets,
            balances: pos.balances
        }
        
        // TODO maybe move to DB module
        if (pos.assets.length) {
            for (let i = 0; i < pos.assets.length; i++) {
                const asset = pos.assets[i];
                if (asset === eventData.asset) {
                    foundAsset = true;
                    tempObject.balances[i] = (BigInt(pos.balances[i]) + eventData.value).toString();
                    break;
                }
            }
        }

        if (!foundAsset) {
            tempObject.assets.push(eventData.asset);
            tempObject.balances.push(eventData.value.toString());
        }

        await db.updatePosition(eventData.id.toString(), tempObject);
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

    // test tasks calculation
    const objs: any[] = [];
    for (let i = 0; i < 100; i++) {
        objs.push({id: i+1, param: i*2});    
    } 
    distributeTasks(objs).then();

    // test contract events monitoring
    const eventMonitor = new ContractEventMonitor(USDT_TOKEN);
    eventMonitor.on('PositionCreated', positionCreatedEvent);
    eventMonitor.on('AssetAdded', assetAddedEvent);
    eventMonitor.on('PositionClosed', positionClosedEvent);
                                             
    // start prices updater
    const pricer = new Prices(PRICE_INTERVAL, CHAIN);
    await pricer.addAddress(AAVE_TOKEN, true); // AAVE token
    
    // Query positions
    console.log('All Positions:', db.getAllPositions());
    const pos = db.findById('b9e9a77b-e489-4263-9925-a606d60c8dad'); 
    // console.log('Position with ID:', pos);
    // console.log(`Position with Owner ${pos?.owner}:`, db.findByOwner(pos?.owner || ''));
    // console.log('Position with order ID = 1:', db.findByOrderId('1'));
    
    console.log('AAVE price: ', pricer.getTokenPrice(AAVE_TOKEN));
    console.log('Token price: ', pricer.getTokenPrice('0xfff9976782d46cc05630d1f6ebab18b2324d6b14'));

    // test sending position to liquidation
    await pushToRedis('hi there');

    // finish background tasks
    await redisClient.disconnect();
    pricer.stopUpdates();
    eventMonitor.stopMonitoring();
})();