import mongoose from 'mongoose';
import {IConnectionDocument} from "./Connection";

const Schema = mongoose.Schema;

export interface IKdbxInstanceDocument extends mongoose.Document {
    name: string;
    content: Buffer;
    connections: IConnectionDocument[];
}

export default mongoose.model<IKdbxInstanceDocument>('KdbxInstance', new Schema({
    name: {
        type: Schema.Types.String,
        trim: true,
    },
    content: {
        type: Schema.Types.Buffer,
    },
    connections: [{
        type: Schema.Types.ObjectId,
        ref: 'Connection',
    }],
}, {
    timestamps: true,
    autoIndex: true,
}));