/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 11/28/18
 * Time: 18:54
 */

import idb from 'idb';

class StorageManager {

    constructor() {
        this.dbName = 'storage';
        this.dbStorageName = 'keyval';
        this.db = null;
    }

    async initDb() {
        try {
            this.db = await idb.open(this.dbName, 1, upgradeDb => {
                upgradeDb.createObjectStore(this.dbStorageName, { autoIncrement: true });
            });
        }
        catch (e) {
            console.log(e);
        }
    }

    getStore() {
        const tx = this.db.transaction(this.dbStorageName, 'readwrite');
        return {
            tx: tx,
            store: tx.objectStore(this.dbStorageName)
        };
    }

    async generateName(name) {
        const hash = await window.crypto.subtle.digest({name: 'SHA-1',}, (new TextEncoder()).encode(`crome${name}kdbx`));
        const hashArray = Array.from(new Uint8Array(hash));
        return hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
    }

    async deleteItem(key) {
        return await this.setItem(key, null);
    }

    async setItem(key, value) {
        if (!this.db) {
            await this.initDb();
        }

        //const name = await this.generateName(key);

        const { tx, store } = this.getStore();
        if (value === null) {
            await store.delete(key);
        }
        else {
            await store.put(value, key);
        }
        return await tx.complete;
    }

    async getItem(key) {
        if (!this.db) {
            await this.initDb();
        }

        //const name = await this.generateName(key);

        const { store } = this.getStore();
        return await store.get(key);
    }
}

export default new StorageManager();