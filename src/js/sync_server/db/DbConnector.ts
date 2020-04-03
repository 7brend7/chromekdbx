/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 2019-08-22
 * Time: 09:54
 */

import {ByteUtils, Credentials} from 'kdbxweb';
import IDbConnector from '../../Interfaces/IDbConnector';
import {IKdbxInstanceDocument} from '../models/KdbxInstance';

class DbConnector implements IDbConnector {
    private kdbxInstance: IKdbxInstanceDocument;
    private credentials: Credentials;


    constructor(kdbxInstance: IKdbxInstanceDocument, credentials: Credentials) {
        this.kdbxInstance = kdbxInstance;
        this.credentials = credentials;
    }

    clear(): Promise<void> {
        return Promise.resolve();
    }

    getCredentials(): Promise<Credentials> {
        return Promise.resolve(this.credentials);
    }

    getDb(): Promise<ArrayBuffer> {
        return Promise.resolve(ByteUtils.arrayToBuffer(this.kdbxInstance.content));
    }

    saveDb(dataAsArrayBuffer: ArrayBuffer): Promise<void> {
        this.kdbxInstance.content = new Buffer(dataAsArrayBuffer);
        this.kdbxInstance.save();
        return Promise.resolve();
    }

}

export default DbConnector;
