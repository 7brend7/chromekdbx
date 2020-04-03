/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 2019-08-21
 * Time: 16:52
 */

import kdbxweb, { Credentials } from 'kdbxweb';
import storageManager from './StorageManager';
import PasswordManager from './PasswordManager';
import IDbConnector from './Interfaces/IDbConnector';

class DbConnector implements IDbConnector {

    async getDb(): Promise<ArrayBuffer> {
        return storageManager.getItem('db');
    }

    async getCredentials(): Promise<Credentials> {
        const passwd = await PasswordManager.get();
        return new kdbxweb.Credentials(passwd, '');
    }

    saveDb(dataAsArrayBuffer: ArrayBuffer): Promise<void> {
        return storageManager.setItem('db', dataAsArrayBuffer);
    }

    clear(): Promise<void> {
        return storageManager.deleteItem('db');
    }

}

export default DbConnector;
