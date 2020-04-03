import Connection, { IConnectionDocument } from "../models/Connection";
import KdbxInstance, { IKdbxInstanceDocument } from "../models/KdbxInstance";
import { Credentials, Kdbx, ProtectedValue } from 'kdbxweb';
import LocalDatabaseManager from '../../LocalDatabaseManager';
import * as kdbxweb from 'kdbxweb';
import PopupItem from "../../Interfaces/PopupItem";
import IDatabaseManager from "../../Interfaces/IDatabaseManager";
import PageItem from "../../PageItem";
import DbConnector from "./DbConnector";

class DatabaseManager {
    private connection: {
        [token: string]: IConnectionDocument
    } = {};
    //private passwdValue: ProtectedValue | null = null;
    //private credentials: Credentials | null = null;
    private db: {
        [token: string]: LocalDatabaseManager
    } = {};

    private async initNew(token: string): Promise<boolean> {
        if (!this.connection[token]) {
            throw new Error('No initialized connection');
        }
        const connection = this.connection[token];
        const credentials: Credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromBinary(connection.password), '');
        const data: Kdbx = Kdbx.create(credentials, connection.name);
        const kdbxInstance = new KdbxInstance({
            name: connection.name,
            content: new Buffer(await data.save())
        });

        this.db[token] = new LocalDatabaseManager(new DbConnector(kdbxInstance, credentials));
        this.addRelations(connection, kdbxInstance);

        return true;
    }

    addRelations(connection: IConnectionDocument, kdbxInstance: IKdbxInstanceDocument) {
        kdbxInstance.connections.push(connection);
        kdbxInstance.save();
        connection.kdbxInstance = kdbxInstance;
        connection.save();
    }

    private async initExisted(token: string, kdbxInstance: IKdbxInstanceDocument): Promise<boolean> {
        if (!this.connection[token]) {
            throw new Error('No initialized connection');
        }

        const connection = this.connection[token];
        const passwdValue = kdbxweb.ProtectedValue.fromBinary(connection.password);
        const credentials = new kdbxweb.Credentials(passwdValue, '');

        this.db[token] = new LocalDatabaseManager(new DbConnector(kdbxInstance, credentials));

        await this.db[token].openDb();

        if (!connection.kdbxInstance) {
            this.addRelations(connection, kdbxInstance);
        }

        return true;
    }

    async initConnection(token: string): Promise<IConnectionDocument | null> {
        const connection = await Connection.findOne({token}).populate({path: 'kdbxInstance', model: KdbxInstance});
        connection && this.setConnection(connection);
        return connection;
    }

    setConnection(connection: IConnectionDocument): void {
        this.connection[connection.token] = connection
    }

    /*initCredentials(dbName: string, password: string): void {
        if (!this.connection) {
            throw new Error('No initialized connection')
        }

        this.connection.dbName = dbName;
        this.passwdValue = kdbxweb.ProtectedValue.fromString(password);
        this.credentials = new kdbxweb.Credentials(this.passwdValue, '');
    }*/

    async initDb(token: string): Promise<boolean> {
        if (!this.connection[token]) {
            throw new Error('No initialized connection');
        }

        let kdbxInstance = this.connection[token].kdbxInstance;

        if (!kdbxInstance) {
            const kdbxInstanceGlobal = await KdbxInstance.findOne({name: this.connection[token].name});
            kdbxInstanceGlobal && (kdbxInstance = kdbxInstanceGlobal);
        }
        (kdbxInstance) ? await this.initExisted(token, kdbxInstance) : await this.initNew(token);

        return true;
    }

    async getDb(token: string): Promise<IDatabaseManager> {
        if (!this.db || typeof this.db[token] === 'undefined') {
            if (this.connection[token] && this.connection[token].kdbxInstance) {
                await this.initExisted(token, this.connection[token].kdbxInstance);
            } else {
                throw new Error('No initialized database')
            }
        }

        return this.db[token];
    }

    async getBinary(token: string): Promise<ArrayBuffer> {
        return (await this.getDb(token)).getBinary();
    }

    async getAll(token: string): Promise<PopupItem[]> {
        return (await this.getDb(token)).getAll();
    }

    async synchronize(token: string, data: ArrayBuffer, time: number): Promise<void> {
        if (!this.connection[token]) {
            throw new Error('No initialized connection');
        }

        const lastSyncTime: number = this.connection[token].syncTime.getTime();

        if (time > lastSyncTime) {
            this.connection[token].kdbxInstance.content = new Buffer(data);
            this.connection[token].kdbxInstance.save();
            this.connection[token].syncTime = new Date(time);
            this.connection[token].save();

            delete this.db[token];
        }
    }

    getSyncTime(token: string): number {
        if (!this.connection[token]) {
            throw new Error('No initialized connection');
        }

        return this.connection[token].syncTime.getTime();
    }
}

export default new DatabaseManager();