/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 11/27/18
 * Time: 10:45
 */

import kdbxweb, { Credentials, Group, Kdbx, KdbxUuid, Entry } from 'kdbxweb';
import storageManager from './StorageManager';
import PasswordManager from './PasswordManager';
import PageItem from './PageItem';
import PopupItem from './Interfaces/PopupItem';

class DatabaseManager {

    private db: Kdbx | null = null;

    async getDb(): Promise<Kdbx> {
        if (!this.db) {
            this.db = await this.openDb();
        }

        return this.db as Kdbx;
    }

    setDb(value: Kdbx | null): void {
        this.db = value;
    }

    async initNew(credentials: Credentials): Promise<void> {
        this.setDb(kdbxweb.Kdbx.create(credentials, 'chromekdbx'));
        return this.saveDb();
    }

    async initExisted(dbBuffer: ArrayBuffer, credentials: Credentials): Promise<Kdbx> {
        this.setDb(await kdbxweb.Kdbx.load(dbBuffer, credentials));
        return this.getDb();
    }

    async openDb(): Promise<Kdbx> {
        const dbBuffer = await storageManager.getItem('db');
        const passwd = await PasswordManager.get();
        const credentials = new kdbxweb.Credentials(passwd, '');

        return this.initExisted(dbBuffer, credentials);
    }

    async saveDb(): Promise<void> {
        const db = await this.getDb();
        const dataAsArrayBuffer = await db.save();
        return storageManager.setItem('db', dataAsArrayBuffer);
    }

    reset(): void {
        this.setDb(null);
    }

    async clear(): Promise<void> {
        await storageManager.deleteItem('db');
    }

    async getBinary(): Promise<ArrayBuffer> {
        const db = await this.getDb();
        return db.save();
    }

    async getChromekdbxGroup(): Promise<Group> {
        const db = await this.getDb();

        const defaultGroup = db.getDefaultGroup();

        const group = defaultGroup.groups.find((item: Group) => item.name === 'chromekdbx');
        return group || db.createGroup(defaultGroup, 'chromekdbx');
    }

    async addIcon(data: ArrayBuffer): Promise<KdbxUuid> {
        const db = await this.getDb();
        const uuid = kdbxweb.KdbxUuid.random();

        db.meta.customIcons[uuid.toString()] = data;

        return uuid;
    }

    /**
     * @param {PageItem} pageItem
     * @returns {Promise<void>}
     */
    async addItem(pageItem: PageItem): Promise<void> {
        const db = await this.getDb();
        const group = await this.getChromekdbxGroup();

        pageItem.fillEntry(db.createEntry(group), db.meta);

        await this.saveDb();
    }

    async findItemByHost(host: string): Promise<Entry[]> {
        const group = await this.getChromekdbxGroup();

        return group.entries.filter((entry: Entry) => {
            const url = new URL(entry.fields.URL as string);
            return url.host === host;
        });
    }

    async getAll(): Promise<PopupItem[]> {
        const db = await this.getDb();
        const group = await this.getChromekdbxGroup();

        return group.entries.map((entry: Entry) => {
            const { UserName, URL } = entry.fields;
            const iconBlob = entry.customIcon && entry.customIcon.id ? new Blob([db.meta.customIcons[entry.customIcon.id]], { type: 'image/x-icon' }) : null;
            const icon = iconBlob ? window.URL.createObjectURL(iconBlob) : '';
            const id = entry.uuid.id ? entry.uuid.id : '';

            return {
                id,
                icon,
                name: UserName as string,
                url: URL as string,
            };
        });
    }

    async deleteItem(id: string): Promise<void> {
        const group = await this.getChromekdbxGroup();
        group.entries = group.entries.filter((item: Entry) => item.uuid.id !== id);
        await this.saveDb();
    }

}

export default new DatabaseManager();
