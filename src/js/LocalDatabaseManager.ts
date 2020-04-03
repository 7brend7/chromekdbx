/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 11/27/18
 * Time: 10:45
 */

import kdbxweb, {Credentials, Group, Kdbx, KdbxUuid, Entry, ByteUtils} from 'kdbxweb';
import PageItem from './PageItem';
import PopupItem from './Interfaces/PopupItem';
import IDatabaseManager from "./Interfaces/IDatabaseManager";
import IDbConnector from "./Interfaces/IDbConnector";
import SynchronizeManager from "./SynchronizeManager";
import synchronizeManagerConnector from "./SynchronizeManager/connector";

class LocalDatabaseManager implements IDatabaseManager {

    private db: Kdbx | null = null;

    private connector: IDbConnector;

    constructor(connector: IDbConnector) {
        this.connector = connector;
    }

    async getDb(): Promise<Kdbx> {
        if (!this.db) {
            this.db = await this.openDb();
        }

        return this.db as Kdbx;
    }

    setDb(value: Kdbx | null): void {
        this.db = value;
    }

    async initNew(credentials: Credentials, dbName: string): Promise<void> {
        this.setDb(kdbxweb.Kdbx.create(credentials, dbName));
        return this.saveDb();
    }

    async initExisted(dbBuffer: ArrayBuffer, credentials: Credentials): Promise<Kdbx> {
        this.setDb(await kdbxweb.Kdbx.load(dbBuffer, credentials));
        return this.getDb();
    }

    async openDb(): Promise<Kdbx> {
        const dbBuffer = await this.connector.getDb();
        const credentials = await this.connector.getCredentials();

        return this.initExisted(dbBuffer, credentials);
    }

    async saveDb(): Promise<void> {
        const db = await this.getDb();
        const dataAsArrayBuffer = await db.save();
        (new SynchronizeManager(synchronizeManagerConnector)).setTimestamp();
        return this.connector.saveDb(dataAsArrayBuffer);
    }

    reset(): void {
        this.setDb(null);
    }

    async clear(): Promise<void> {
        return this.connector.clear();
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
            const icon = entry.customIcon && entry.customIcon.id ? ByteUtils.bytesToBase64(db.meta.customIcons[entry.customIcon.id]) : null;
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

export default LocalDatabaseManager;
