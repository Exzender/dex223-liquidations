export type Asset = {
    address: string;
    value: string
}

export type Position = {
    id: string; // bigint
    orderId: string; // bigint
    owner: string;
    assets: Asset[];
    whitelistedTokens: string[];
    whitelistedTokenList?: string;
    created: Date; // NOTE there is no such field in smart contract
    deadline: Date;
    baseAsset: string;
    initialBalance: string; // bigint
    interest: number;
    initialSum: number;  //initial position VALUE (price) so we can compare it later
    // TODO also need to store liquidation reward
};

export type ContractPosition = {
    id: bigint;
    orderId: bigint; 
    owner: string;
    assets: string[];
    balances: bigint[]; 
    whitelistedTokens: string[];
    whitelistedTokenList?: string;
    deadline: bigint;
    baseAsset: string;
    initialBalance: bigint; 
    interest: bigint;
};

export type AssetChange = {
    id: bigint;
    asset: string;
    value: bigint;
}
