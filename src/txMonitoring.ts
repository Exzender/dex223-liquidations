import { ethers } from 'ethers';
import { ethRpcArray, testContractPositions, testEvents } from './const';
import EventEmitter from 'events';
import { ContractPosition, AssetChange } from "./position";
import { delay } from './utils';

const abi = [
    // Example event ABI
    "event Transfer(address indexed from, address indexed to, uint256 value)"
];

export class ContractEventMonitor extends EventEmitter{
    private provider: ethers.Provider;
    private contract: ethers.Contract;
    private readonly address: string;
    // private readonly abi: any[];

    constructor(contractAddress: string) { //}, abi: any[]) {
        super();
        // Initialize the Ethereum provider using an RPC URL
        this.provider = new ethers.JsonRpcProvider(ethRpcArray[0]);
        
        this.address = contractAddress;
        // this.abi = abi;

        // Initialize the contract instance with the ABI and address
        this.contract = new ethers.Contract(contractAddress, abi, this.provider);
        
        this.monitorEvent = this.monitorEvent.bind(this);
        this.generateFakeEvents = this.generateFakeEvents.bind(this);
        // NOTE start monitoring 
        setTimeout(this.monitorEvent, 1000, 'Transfer');
        setTimeout(this.generateFakeEvents, 2000);
    }
    
    // NOTE how often need to check provider ?
    async checkProvider() {
        let isGood = true;
        try {
            await this.provider.getBlockNumber();
        } catch (e) {
            isGood = false;
        }
        
        if (!isGood) {
            try {
                await this.contract.removeAllListeners();
            } catch (e) {
                // 
            }
            
            for (const url of ethRpcArray) {
                try {
                    const provider = new ethers.JsonRpcProvider(url);
                    // Check if the provider is connected by making a simple request
                    await provider.getBlockNumber();  // This will throw an error if the provider is down
                    this.provider = provider;
                    this.contract = new ethers.Contract(this.address, abi, this.provider);

                    // NOTE start monitoring
                    setTimeout(this.monitorEvent, 1000, 'Transfer');
                    
                    return;
                } catch (error) {
                    // console.log(`Provider failed: ${url}, Error: ${error.message}`);
                }
            }
            throw new Error("No available providers.");
        }
    }
    
    // TODO get real position from Blockchain instead of fake test data
    async getPositionData(id: bigint): Promise<ContractPosition> {
        for (let pos of testContractPositions) {
            if (pos.id === id) {
                return pos;
            }
        }
        return testContractPositions[0];    
    }
    
    // TODO test manually added events 
    private async generateFakeEvents(): Promise<void> {
        for (let event of testEvents) {
            await this.processEvent(event);
            await delay(1000);
        }    
    }

    // process smart contract event
    async processEvent(eventData: any) {
        switch (eventData.event) {
            case 'PositionCreated': {
                // get full positions info
                const pos = await this.getPositionData(eventData.returnValues['0']);
                this.emit('PositionCreated', pos);
                break;
            }
            case 'AssetAdded': {
                // copy asset changes
                const obj: AssetChange = {
                    id: eventData.returnValues['_positionId'],
                    asset: eventData.returnValues['_asset'],
                    value: eventData.returnValues['_value'],
                }
                this.emit('AssetAdded', obj);
                break;
            }
            case 'PositionClosed': {
                // TODO also add owner to returned values ?
                this.emit('PositionClosed', eventData.returnValues['0']);
                break;
            }
            default: {}
        }
    }

    // Start monitoring a specific event by event name and callback function
    monitorEvent(eventName: string) {
        this.contract.on(eventName, (...eventData) => {
            console.log(`Event ${eventName} received:`, eventData);

            // Call the user-provided callback with event data
            this.processEvent(eventData);
        }).then();

        console.log(`Started listening for ${eventName} events...`);
    }

    // Stop monitoring all events
    public stopMonitoring() {
        this.contract.removeAllListeners().then();
        console.log("Stopped listening for events.");
    }
}
