/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 11/27/18
 * Time: 10:46
 */

import kdbxweb from 'kdbxweb';
import storageManager from './StorageManager';

class PasswordManager {

    constructor() {
    }

    async set(passwd) {
        this.passwd = kdbxweb.ProtectedValue.fromString(passwd);
        await storageManager.setItem('password', this.passwd.getBinary());
        return await this.get();
    }


    async get() {
        const passwdBinary = await storageManager.getItem('password');
        return kdbxweb.ProtectedValue.fromBinary(passwdBinary);
    }
}

export default new PasswordManager();