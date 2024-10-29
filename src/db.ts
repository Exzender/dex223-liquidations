import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import lodash from 'lodash';
import { Position } from './position';

// Custom class that extends Low to integrate lodash chaining
class LowWithLodash<T> extends Low<T> {
    // Initialize lodash chain for 'data' property
    chain: lodash.ExpChain<this['data']> = lodash.chain(this).get('data');
}

interface Data {
    positions: Position[];
}

// Class to encapsulate the database functionality
export class PosDatabase extends LowWithLodash<Data> {
    // private db: Low<Data>;

    // Constructor to initialize the database
    constructor(dbFilePath: string) {
        const adapter = new JSONFile<Data>(dbFilePath);
        const defaultData: Data = {positions: []};
        // this.db = new Low(adapter, defaultData);
        super(adapter, defaultData);
    }

    // Initialize the database with default structure if needed
    async initialize() {
        await this.read(); // Read the database file into memory

        // Initialize the data structure if the database is empty or uninitialized
        if (!this.data) {
            this.data = { positions: [] };
            await this.write();
        }
    }

    // Add a position to the database
    async addPosition(position: Position) {
        this.data!.positions.push(position); 
        await this.write(); // Write changes to the file
    }

    // Delete a position by ID
    async deletePosition(id: string): Promise<boolean> {
        const positionExists = this.chain.get('positions').some({ id }).value();
        if (positionExists) {
            // Remove the position with the specified ID
            this.data!.positions = this.chain.get('positions').reject({ id }).value();
            await this.write(); // Save changes to the file
            return true; // Return true if deletion was successful
        }
        return false; // Return false if position was not found
    }

    // Update a position by ID
    async updatePosition(id: string, updatedData: Partial<Position>): Promise<boolean> {
        const positionIndex = this.chain.get('positions').findIndex({ id }).value();

        // Check if position exists
        if (positionIndex !== -1) {
            // Update the specific position's data
            this.data!.positions[positionIndex] = {
                ...this.data!.positions[positionIndex],
                ...updatedData
            };
            await this.write(); // Write changes to the file
            return true; // Return true if update was successful
        }

        return false; // Return false if position was not found
    }

    // Get all positions from the database
    getAllPositions(): Position[] {
        return this.chain.get('positions').value();
    }

    // Find a position by ID
    findById(id: string): Position | undefined {
        return this.chain.get('positions').find({ id }).value();
    }
    
    // Find a position by order ID
    findByOrderId(orderId: string): Position | undefined {
        return this.chain.get('positions').find({ orderId }).value();
    }
    
    // Find a position by owner address
    findByOwner(owner: string): Position | undefined {
        return this.chain.get('positions').find({ owner }).value();
    }

    // Find all position above a certain ...
    // findPositionsAbove(owner: string): Position[] {
    //     return this.chain.get('positions').filter((position: Position) => position.owner > owner).value();
    // }
}