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

    get db() {
        return (async () => {
            if (!this._db) {
                return await this.openDb();
            }
            else {
                return await this._db
            }

        })();
    }

    set db(value) {
        this._db = value;
    }

    constructor() {
        this.db = null;
    }

    async initNew(credentials) {
        this.db = kdbxweb.Kdbx.create(credentials, 'chromekdbx');

        return await this.saveDb();
    }

    async initExisted(dbBuffer, credentials) {
        this.db = await kdbxweb.Kdbx.load(dbBuffer, credentials);
        return this.db;
    }

    async openDb() {
        const dbBuffer = await storageManager.getItem('db');
        const passwd = await passwordManager.get();
        const credentials = new kdbxweb.Credentials(passwd, null);

        return await this.initExisted(dbBuffer, credentials);
    }

    async saveDb() {
        const db = await this.db;
        const dataAsArrayBuffer = await db.save();
        return await storageManager.setItem('db', dataAsArrayBuffer);
    }

    reset () {
        this.db = null;
    }

    async clear() {
        await storageManager.deleteItem('db');
    }

    async getBinary() {
        const db = await this.db;
        return await db.save();
    }

    async getChromekdbxGroup() {
        const db = await this.db;

        const defaultGroup = db.getDefaultGroup();

        const group = defaultGroup.groups.find(item => item.name === 'chromekdbx');
        return group ? group : db.createGroup(defaultGroup, 'chromekdbx');
    }

    async addItem(data) {
        const db = await this.db;
        const group = await this.getChromekdbxGroup();

        const entry = db.createEntry(group);
        entry._setField('UserName', data.name);
        entry._setField('Password', data.password, db.meta.memoryProtection.password);
        entry._setField('URL', data.url, db.meta.memoryProtection.url);
        entry._setField('Title', data.title);
        entry._setField('chrome_kdbx', data.meta, true);

        await this.saveDb();
    }

    async findItemByHost(host) {
        const group = await this.getChromekdbxGroup();

        return group.entries.filter(entry => {
            const url = new URL(entry.fields.URL);
            return url.host === host;
        })
    }
}

export default new DatabaseManager();