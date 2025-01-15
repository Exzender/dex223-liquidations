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
        assets: [{address: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14', value: (10).toString()}],
        whitelistedTokens: ['0xfff9976782d46cc05630d1f6ebab18b2324d6b14'],
        whitelistedTokenList: undefined,
        created: new Date(),
        deadline: new Date(),
        baseAsset: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
        initialBalance: (10).toString(),
        interest: 15, 
        initialSum: 0
    },
    {
        id: Crypto.randomUUID().toString(), // TODO should be position ID from contract
        orderId: (2).toString(),
        owner: '0xF5bEC430576fF1b82e44DDB5a1C93F6F9d0884f3',
        assets: [{address: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14', value: (10).toString()}],
        whitelistedTokens: ['0xfff9976782d46cc05630d1f6ebab18b2324d6b14'],
        whitelistedTokenList: undefined,
        created: new Date(),
        deadline: new Date(),
        baseAsset: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
        initialBalance: (10).toString(),
        interest: 15,
        initialSum: 0
    }
];

export const testEvents: any[] = [
    {
        blockNumber: 10186365n,
        transactionHash: '0xab963966004381fd25bd1cf48400299ad2dd621be7a2e847c5bbf24509651722',
        transactionIndex: 0n,
        blockHash: '0x0c1304043e25538284390ff284d60d682b37a019ecc1e0653e13ed38facd2a76',
        logIndex: 0n,
        returnValues: {
            '0': 1n,
            '1': 1n,
            '2': '0xF5bEC430576fF1b82e44DDB5a1C93F6F9d0884f3',
            __length__: 3,
            _positionId: 1n,
            _orderId: 1n,
            _owner: '0xF5bEC430576fF1b82e44DDB5a1C93F6F9d0884f3',
        },
        event: 'PositionCreated',
    },
    {
        blockNumber: 10186365n,
        transactionHash: '0xab963966004381fd25bd1cf48400299ad2dd621be7a2e847c5bbf24509651722',
        transactionIndex: 0n,
        blockHash: '0x0c1304043e25538284390ff284d60d682b37a019ecc1e0653e13ed38facd2a76',
        logIndex: 0n,
        returnValues: {
            '0': 1n,
            '1': '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
            '2': 10000n,
            __length__: 3,
            _positionId: 1n,
            _asset: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
            _value: 10000n
        },
        event: 'AssetAdded',
    },
    {
        blockNumber: 10186365n,
        transactionHash: '0xab963966004381fd25bd1cf48400299ad2dd621be7a2e847c5bbf24509651722',
        transactionIndex: 0n,
        blockHash: '0x0c1304043e25538284390ff284d60d682b37a019ecc1e0653e13ed38facd2a76',
        logIndex: 0n,
        returnValues: {
            '0': 1n,
            '1': '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
            '2': 9000n,
            __length__: 3,
            _positionId: 1n,
            _asset: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
            _value: 9000n
        },
        event: 'AssetAdded',
    },
    {
        blockNumber: 10186365n,
        transactionHash: '0xab963966004381fd25bd1cf48400299ad2dd621be7a2e847c5bbf24509651722',
        transactionIndex: 0n,
        blockHash: '0x0c1304043e25538284390ff284d60d682b37a019ecc1e0653e13ed38facd2a76',
        logIndex: 0n,
        returnValues: {
            '0': 1n,
            '1': 1n,
            '2': '0xF5bEC430576fF1b82e44DDB5a1C93F6F9d0884f3',
            __length__: 3,
            _positionId: 1n,
            _orderId: 1n,
            _owner: '0xF5bEC430576fF1b82e44DDB5a1C93F6F9d0884f3',
        },
        event: 'PositionClosed',
    }
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
