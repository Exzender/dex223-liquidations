import { createClient } from 'redis';
import { delay } from './utils';

// Redis client setup
const redisClient = createClient({
    url: 'redis://localhost:6379' // Adjust the URL to match your Redis server setup
});

async function liquidate(positionId: string): Promise<void> {
    // call liquidation function
    // wait for result
    // analyze result
    // save result to redis
}

// Async function to process objects
async function processObjects() {
    try {
        await redisClient.connect(); // Establish connection to Redis
        console.log('Connected to Redis');

        while (true) {
            // Fetch an object from Redis (assuming objects are stored in a list)
            const object = await redisClient.lPop('myQueue'); // 'myQueue' is the key of the list in Redis

            if (object) {
                // Process the object (your custom processing logic goes here)
                console.log('Processing object:', object);

                // Simulate processing delay
                await delay(100);

                // Object has been processed and already removed from Redis (because lpop removes it)
                console.log('Object processed and removed from Redis.');
            } else {
                // If no object is available, wait for 1 second and check again
                console.log('No objects to process, waiting for 1 second...');
                await delay(1000);
            }
        }
    } catch (err) {
        console.error('Error processing objects:', err);
    } finally {
        await redisClient.quit(); // Close the Redis connection when done
    }
}

// Start processing objects
processObjects();
