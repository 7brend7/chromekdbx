/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 11/27/18
 * Time: 10:45
 */

import kdbxweb from 'kdbxweb';
import storageManager from "./StorageManager";
import passwordManager from "./PasswordManager";

class DatabaseManager {

    constructor() {
        this.db = null;
    }

    initNew(credentials) {
        const db = kdbxweb.Kdbx.create(credentials, 'chromekdbx');

        db.save().then(dataAsArrayBuffer => {
            storageManager.setItem('db', dataAsArrayBuffer);
        });

    }

    initExisted(db) {
        //return new DatabaseManager(db);
    }

    async openDb() {
        const dbBuffer = await storageManager.getItem('db');
        const passwd = await passwordManager.get();
        const credentials = new kdbxweb.Credentials(passwd, null);

        this.db = await kdbxweb.Kdbx.load(dbBuffer, credentials);

        console.log(this.db);
    }
}

export default new DatabaseManager();