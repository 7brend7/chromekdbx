/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 11/27/18
 * Time: 10:45
 */

import kdbxweb from 'kdbxweb';
import storageManager from "./StorageManager";

class DatabaseManager {

    constructor(db) {

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
}

export default new DatabaseManager();