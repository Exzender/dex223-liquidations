export interface Position {
    id: string, // bigint,
    orderId: string, // bigint,
    owner: string,
    assets: string[],
    balances: string[], // bigint[],
    whitelistedTokens: string[],
    whitelistedTokenList: string | undefined,
    created: Date, // NOTE there is no such field in smart contract
    deadline: Date,
    baseAsset: string,
    initialBalance: string, // bigint,
    interest: number
    // TODO we have to store initial position VALUE (price) so we can compare it later
}