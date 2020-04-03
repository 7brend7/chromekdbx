import mongoose from 'mongoose';
import {IKdbxInstanceDocument} from "./KdbxInstance";

const Schema = mongoose.Schema;

export interface IConnectionDocument extends mongoose.Document {
    name: string;
    extensionId: string;
    token: string;
    syncTime: Date;
    password: Buffer;
    kdbxInstance: IKdbxInstanceDocument;
}

export default mongoose.model<IConnectionDocument>('Connection', new Schema({
    name: {
        type: Schema.Types.String,
        trim: true,
        required: true,
    },
    extensionId: {
        type: Schema.Types.String,
        trim: true,
        required: true,
    },
    token: {
        type: Schema.Types.String,
        unique: true,
        trim: true,
        required: true,
    },
    syncTime: {
        type: Schema.Types.Date,
        required: true,
        default: Date.now(),
    },
    password: {
        type: Schema.Types.Buffer,
    },
    kdbxInstance: {
        type: Schema.Types.ObjectId,
        ref: 'KdbxInstance',
    },
}, {
    timestamps: true,
    autoIndex: true,
}));