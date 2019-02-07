/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 11/27/18
 * Time: 10:45
 */

import kdbxweb from 'kdbxweb';
import storageManager from './StorageManager';
import PasswordManager from './PasswordManager';

class DatabaseManager {

    get db() {
        return (async () => (!this._db ? this.openDb() : this._db))();
    }

    set db(value) {
        this._db = value;
    }

    constructor() {
        this.db = null;
    }

    async initNew(credentials) {
        this.db = kdbxweb.Kdbx.create(credentials, 'chromekdbx');

        return this.saveDb();
    }

    async initExisted(dbBuffer, credentials) {
        this.db = await kdbxweb.Kdbx.load(dbBuffer, credentials);
        return this.db;
    }

    async openDb() {
        const dbBuffer = await storageManager.getItem('db');
        const passwd = await PasswordManager.get();
        const credentials = new kdbxweb.Credentials(passwd, null);

        return this.initExisted(dbBuffer, credentials);
    }

    async saveDb() {
        const db = await this.db;
        const dataAsArrayBuffer = await db.save();
        return storageManager.setItem('db', dataAsArrayBuffer);
    }

    reset() {
        this.db = null;
    }

    async clear() {
        await storageManager.deleteItem('db');
    }

    async getBinary() {
        const db = await this.db;
        return db.save();
    }

    async getChromekdbxGroup() {
        const db = await this.db;

        const defaultGroup = db.getDefaultGroup();

        const group = defaultGroup.groups.find(item => item.name === 'chromekdbx');
        return group || db.createGroup(defaultGroup, 'chromekdbx');
    }

    async addIcon(data) {
        const db = await this.db;
        const uuid = kdbxweb.KdbxUuid.random();

        db.meta.customIcons[uuid] = data;

        return uuid;
    }

    /**
     * @param PageItem pageItem
     * @returns {Promise<void>}
     */
    async addItem(pageItem) {
        const db = await this.db;
        const group = await this.getChromekdbxGroup();

        pageItem.fillEntry(db.createEntry(group), db.meta);

        await this.saveDb();
    }

    async findItemByHost(host) {
        const group = await this.getChromekdbxGroup();

        return group.entries.filter((entry) => {
            const url = new URL(entry.fields.URL);
            return url.host === host;
        });
    }

    async getAll() {
        const db = await this.db;
        const group = await this.getChromekdbxGroup();

        return group.entries.map((entry) => {
            const { UserName, URL } = entry.fields;
            let icon = entry.customIcon ? new Blob([db.meta.customIcons[entry.customIcon.id]], { type: 'image/x-icon' }) : null;
            icon && (icon = window.URL.createObjectURL(icon));

            return {
                name: UserName,
                url: URL,
                id: entry.uuid.id,
                icon,
            };
        });
    }

    async deleteItem(id) {
        const group = await this.getChromekdbxGroup();
        group.entries = group.entries.filter(item => item.uuid.id !== id);
        await this.saveDb();
    }

}

export default new DatabaseManager();
