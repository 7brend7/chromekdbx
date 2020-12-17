import mongoose from 'mongoose'
import { MongoError } from 'mongodb'

export default async () => {
    const connectionString = process.env.MONGO_CONN_URL

    const client = connectionString && (await mongoose.connect(connectionString, { useNewUrlParser: true }))
}
