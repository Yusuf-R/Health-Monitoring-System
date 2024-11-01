import mongoose from 'mongoose';

class MongoDBClient {
    constructor() {
        this.isConnected = false;
    }

    // Initialize MongoDB connection
    async connect() {
        if (this.isConnected) {
            console.log("💡 Already connected to MongoDB 😁");
            return;
        }

        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error("👺 Error: Invalid/Missing environment variable MONGODB_URI 🚨");
            throw new Error("Invalid/Missing environment variable MONGODB_URI");
        }

        try {
            const db = await mongoose.connect(uri);
            this.isConnected = db.connections[0].readyState === 1;

            if (this.isConnected) {
                console.log("🚀 Successfully connected to MongoDB 🤩");
            } else {
                console.error("👺 Failed to connect to MongoDB 🚨");
                throw new Error("Failed to connect to MongoDB");
            }
        } catch (error) {
            console.error("👺 Error connecting to MongoDB: 🚨", error.message);
            throw error;
        }
    }

    // Check if the connection is alive
    isAlive() {
        return this.isConnected;
    }

    // Close the MongoDB connection
    async close() {
        if (this.isConnected) {
            await mongoose.disconnect();
            console.log("🔌 MongoDB connection closed");
            this.isConnected = false;
        }
    }
}

// Export the MongoDBClient instance
const dbClient = new MongoDBClient();
export default dbClient;
