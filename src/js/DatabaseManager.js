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

    async addIcon(data) {
        const db = await this.db;
        const uuid = kdbxweb.KdbxUuid.random();

        db.meta.customIcons[uuid] = data;

        return uuid;
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
        typeof data.icon !== 'undefined' && (entry.customIcon = data.icon);

        await this.saveDb();
    }

    async findItemByHost(host) {
        const group = await this.getChromekdbxGroup();

        return group.entries.filter(entry => {
            const url = new URL(entry.fields.URL);
            return url.host === host;
        })
    }

    async getAll() {
        const db = await this.db;
        const group = await this.getChromekdbxGroup();

        return group.entries.map(entry => {
            const { UserName, URL } = entry.fields;
            let icon = entry.customIcon ? new Blob([db.meta.customIcons[entry.customIcon.id]], {type: 'image/x-icon'}) : null;
            if (icon) {
                icon = window.URL.createObjectURL(icon);
            }
            else {
                // TODO: some default icon here
            }

            return {
                name: UserName,
                url: URL,
                id: entry.uuid.id,
                icon
            };
        })
    }

    async deleteItem(id) {
        const group = await this.getChromekdbxGroup();
        group.entries = group.entries.filter(item => item.uuid.id !== id);
        await this.saveDb();
    }
}

export default new DatabaseManager();