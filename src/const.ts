import Crypto from 'crypto';
import { ContractPosition, Position } from './position';

export const ethRpcArray = [
    // 'https://ethereum.blockpi.network/v1/rpc/public', // filtered monitoring does not work
    // 'https://eth.llamarpc.com', // filtered monitoring does not work
    // 'https://eth.meowrpc.com', // filtered monitoring does not work
    // 'https://ethereum.publicnode.com', // filtered monitoring does not work
    // 'https://eth-mainnet.public.blastapi.io', // filtered monitoring does not work
    // 'https://rpc.payload.de', // filtered monitoring does not work
    // 'https://1rpc.io/eth', // filtered monitoring does not work

    // 'https://rpc.ankr.com/eth', // filtered monitoring does not work
    // 'https://api.securerpc.com/v1', // filtered monitoring does not work
    // 'https://cloudflare-eth.com', // filtered monitoring does not work
    'https://eth-pokt.nodies.app',  // work OK
    'https://eth.drpc.org', // work OK
    'https://rpc.mevblocker.io',  // work OK
];

export const testPositions: Position[] = [
    {
        id: Crypto.randomUUID().toString(), // TODO should be position ID from contract
        orderId: (1).toString(),
        owner: '0xF5bEC430576fF1b82e44DDB5a1C93F6F9d0884f3',
        assets: ['0xfff9976782d46cc05630d1f6ebab18b2324d6b14'],
        balances: [(10).toString()],
        whitelistedTokens: ['0xfff9976782d46cc05630d1f6ebab18b2324d6b14'],
        whitelistedTokenList: undefined,
        created: new Date(),
        deadline: new Date(),
        baseAsset: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
        initialBalance: (10).toString(),
        interest: 15
    },
    {
        id: Crypto.randomUUID().toString(), // TODO should be position ID from contract
        orderId: (2).toString(),
        owner: '0xF5bEC430576fF1b82e44DDB5a1C93F6F9d0884f3',
        assets: ['0xfff9976782d46cc05630d1f6ebab18b2324d6b14'],
        balances: [(10).toString()],
        whitelistedTokens: ['0xfff9976782d46cc05630d1f6ebab18b2324d6b14'],
        whitelistedTokenList: undefined,
        created: new Date(),
        deadline: new Date(),
        baseAsset: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
        initialBalance: (10).toString(),
        interest: 15
    }
];

export const testEvents: any[] = [
    {}
];

export const testContractPositions: ContractPosition[] = [
    {
        id: 1n,
        orderId: 1n,
        owner: '0xF5bEC430576fF1b82e44DDB5a1C93F6F9d0884f3',
        assets: ['0xfff9976782d46cc05630d1f6ebab18b2324d6b14'],
        balances: [15n],
        whitelistedTokens: ['0xfff9976782d46cc05630d1f6ebab18b2324d6b14'],
        whitelistedTokenList: undefined,
        deadline: 1732782702n,
        baseAsset: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
        initialBalance: 15n,
        interest: 15n
    }    
]
