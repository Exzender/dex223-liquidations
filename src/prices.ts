// get real token prices
// return price for requested token
// should it be service, monitoring/getting prices from API 
// how to get prices not included in API ?

import axios from 'axios';

const API_PATH = 'https://api-data.absolutewallet.com/api/v1/currencies/minimal/';

export class Prices {
    private localPrices = new Map<string, number>();
    private addressList = new Set<string>();
    private timerId: number | null = null;
    private readonly updateInterval: number;
    private readonly chain: string;

    // price update interval should be configurable
    constructor(updateInterval: number, chain: string = 'eth') {
        this.updateInterval = updateInterval < 1000 ? 2000 : updateInterval;   
        this.chain = chain;
    }
    
    getTokenPrice(address: string): number {
        if (this.localPrices.has(address)) {
            return this.localPrices.get(address) ?? 0;
        }
        return 0;    
    }
    
    async addAddress(address: string, callUpdate: boolean = false): Promise<void> {
        const len = this.addressList.size;
        this.addressList.add(address);    
        
        if (this.addressList.size > len && callUpdate) {
            await this.updatePrices();
        }
    }
    
    async updatePrices() {
        if (this.timerId) {
            clearTimeout(this.timerId);
        }

        for (let address of this.addressList) {
            // TODO make calls in parallel ?
            try {
                const apiAddress = `${API_PATH}${this.chain}/${address}?fiat=USD`;
                const req = await axios(apiAddress);
                this.localPrices.set(address, req.data.price ?? 0);
            } catch (e) {
                // console.error(e);
            }
        }

        // @ts-ignore
        this.timerId = setTimeout(this.updatePrices, this.updateInterval);
    }
    
    stopUpdates() {
        if (this.timerId) {
            clearTimeout(this.timerId);
        }    
    }
}