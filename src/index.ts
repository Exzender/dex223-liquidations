import { PosDatabase } from './db';
import { Position } from './position';
import { Prices } from './prices';
import Crypto from 'crypto';
import { ContractEventMonitor } from './txMonitoring';
import { createClient } from 'redis';
import { distributeTasks } from './calcPosition';

const PRICE_INTERVAL = 5000;
const CHAIN = 'eth';

const AAVE_TOKEN = '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9';
const USDT_TOKEN = '0xdac17f958d2ee523a2206206994597c13d831ec7';

const redisClient = createClient({
    url: 'redis://localhost:6379' // Adjust the URL to match your Redis server setup
});

async function pushToRedis(data: string): Promise<void> {
    await redisClient.lPush('myQueue', data);        
}

// run by timer. get results from redis. remove processed. move back unprocessed
async function checkLiquidationResults() {
    
}

(async() => {
    await redisClient.connect();
    
    const db = new PosDatabase('./data/db.json');

    // Initialize the database
    await db.initialize();
    
    const all = db.getAllPositions();
    
    if (all.length === 0) {
        // Add some positions
        const date = new Date();
        const deadline = new Date();
        deadline.setDate(date.getDate() + 30);
        const newPosition: Position = {
            id: Crypto.randomUUID().toString(), // TODO should be position ID from contract
            orderId: (1).toString(), 
            owner: '0xF5bEC430576fF1b82e44DDB5a1C93F6F9d0884f3',
            assets: ['0xfff9976782d46cc05630d1f6ebab18b2324d6b14'],
            balances: [(10).toString()],
            whitelistedTokens: ['0xfff9976782d46cc05630d1f6ebab18b2324d6b14'],
            whitelistedTokenList: undefined,
            created: date,
            deadline: deadline,
            baseAsset: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
            initialBalance: (10).toString(),
            interest: 15
        };
        
        await db.addPosition(newPosition);
    }

    // test tasks calculation
    const objs: any[] = [];
    for (let i = 0; i < 100; i++) {
        objs.push({id: i+1, param: i*2});    
    } 
    distributeTasks(objs).then();

    // test contract events monitoring
    const eventMonitor = new ContractEventMonitor(USDT_TOKEN);
    eventMonitor.on('processEvent', (data) => {
        console.log('got event in main');
        // TODO process new/updated positions
        // filter out unwanted ones (not fit by criteria)
    } );
                                             
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

    // stop prices updater
    pricer.stopUpdates();

    // test sending position to liquidation
    await pushToRedis('hi there');

    await redisClient.disconnect();
})();