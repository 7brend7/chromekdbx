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

        /** @type ProtectedValue */
        this.passwd = null;

        this.init();
    }

    init() {
    }

    set(passwd) {
        this.passwd = kdbxweb.ProtectedValue.fromString(passwd);
        storageManager.setItem('password', this.passwd.getBinary());
        return this.get();
    }


    get() {
        return this.passwd;
    }
}

export default new PasswordManager();