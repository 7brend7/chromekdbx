/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 11/27/18
 * Time: 10:46
 */

import kdbxweb from 'kdbxweb';
import storageManager from './StorageManager';

class PasswordManager {

    static async set(passwd) {
        const passwdValue = kdbxweb.ProtectedValue.fromString(passwd);
        await storageManager.setItem('password', passwdValue.getBinary());
        return this.get();
    }

    static async get() {
        const passwdBinary = await storageManager.getItem('password');
        return kdbxweb.ProtectedValue.fromBinary(passwdBinary);
    }

    static async clear() {
        await storageManager.deleteItem('password');
    }

}

export default PasswordManager;
