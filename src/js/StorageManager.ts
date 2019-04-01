/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 11/28/18
 * Time: 18:54
 */

import idb, { DB, Transaction, UpgradeDB, ObjectStore } from 'idb';

class StorageManager {

    private dbName = 'storage';

    private dbStorageName = 'keyval';

    private db?: DB;

    async initDb(): Promise<void> {
        try {
            this.db = await idb.open(this.dbName, 1, (upgradeDb: UpgradeDB) => {
                upgradeDb.createObjectStore(this.dbStorageName, { autoIncrement: true });
            });
        } catch (e) {
            // eslint-disable-next-line no-console
            console.log(e);
        }
    }

    getStore(): {tx: Transaction, store: ObjectStore<any, any>} {
        if (!this.db) {
            throw new Error('db is not initialized');
        }

        const tx = this.db.transaction(this.dbStorageName, 'readwrite');

        return {
            tx,
            store: tx.objectStore(this.dbStorageName),
        };
    }

    /**
     * @deprecated
     *
     * @param name
     * @returns {Promise<string>}
     */
    static async generateName(name: string): Promise<string> {
        const hash = await window.crypto.subtle.digest({ name: 'SHA-1' }, (new TextEncoder()).encode(`crome${name}kdbx`));
        const hashArray = Array.from(new Uint8Array(hash));
        return hashArray.map(b => (`00${b.toString(16)}`).slice(-2)).join('');
    }

    async deleteItem(key: IDBKeyRange | IDBValidKey): Promise<void> {
        await this.setItem(key, null);
    }

    async setItem(key: IDBKeyRange | IDBValidKey, value: any): Promise<void> {
        if (!this.db) {
            await this.initDb();
        }

        // const name = await this.generateName(key);

        const { tx, store } = this.getStore();
        if (value === null) {
            await store.delete(key);
        } else {
            await store.put(value, key);
        }
        return tx.complete;
    }

    async getItem(key: IDBKeyRange | IDBValidKey): Promise<any> {
        if (!this.db) {
            await this.initDb();
        }

        // const name = await this.generateName(key);

        const { store } = this.getStore();
        return store.get(key);
    }

}

export default new StorageManager();
