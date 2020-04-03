import ApiManager from './ApiManager';
import PopupItem from './Interfaces/PopupItem';
import kdbxweb, { Credentials, Entry, Kdbx, KdbxUuid } from 'kdbxweb';
import PageItem from './PageItem';
import IDatabaseManager from './Interfaces/IDatabaseManager';
import ApiEntry from "./Interfaces/ApiEntry";
import LocalDatabaseManager from "./LocalDatabaseManager";
import DbConnector from "./DbConnector";
import PasswordManager from "./PasswordManager";
import SynchronizeManager from "./SynchronizeManager";
import synchronizeManagerConnector from "./SynchronizeManager/connector";

class ApiDatabaseManager implements IDatabaseManager {

    private apiManager: ApiManager = new ApiManager();

    private credentials: Credentials | null = null;

    private databaseManager: LocalDatabaseManager | null = null;

    async initPasswd() {
        const passwd = await PasswordManager.get();
        this.credentials = new kdbxweb.Credentials(passwd, '');
    }

    async getDbManager(): Promise<LocalDatabaseManager> {
        if (!this.databaseManager) {
            await this.reloadLocal();
        }
        if (!this.databaseManager) {
            throw new Error('no initialized database');
        }

        return this.databaseManager;
    }

    async getAll(): Promise<PopupItem[]> {
        return (await this.getDbManager()).getAll();
    }

    async findItemByHost(host: string): Promise<ApiEntry[]> {
        return (await this.getDbManager()).findItemByHost(host);
    }

    async addIcon(data: ArrayBuffer): Promise<KdbxUuid> {
        return (await this.getDbManager()).addIcon(data);
    }

    async getDb(): Promise<Kdbx> {
        return (await this.getDbManager()).getDb();
    }

    reset(): void {

    }

    async clear(): Promise<void> {
        return this.apiManager.clear();
    }

    async connect(name: string, password: string): Promise<void> {
        await PasswordManager.set(password);

        return this.apiManager.connect(name, password);
    }

    async getBinary(): Promise<ArrayBuffer> {
        return this.apiManager.getBinary();
    }

    async addItem(pageItem: PageItem): Promise<void> {
        await (await this.getDbManager()).addItem(pageItem);
        await this.synchronize();
    }

    async deleteItem(id: string): Promise<void> {
        await (await this.getDbManager()).deleteItem(id);
        await this.synchronize();
    }

    async reloadLocal(data: ArrayBuffer | null = null): Promise<void> {
        if (!this.credentials) {
            await this.initPasswd();
        }

        const connector = new DbConnector();
        if (!data) {
            data = await this.getBinary();
        }
        
        await connector.saveDb(data);
        this.databaseManager = new LocalDatabaseManager(connector);
    }

    async synchronize(): Promise<void> {
        const synchronizeManager = new SynchronizeManager(synchronizeManagerConnector);

        const currentSyncTime: number = synchronizeManager.getCurrentTimestamp();
        const data: ArrayBuffer = await (await this.getDbManager()).getBinary();
        const { db, time } = await this.apiManager.synchronize(data, currentSyncTime);

        synchronizeManager.setTimestamp(new Date(time));
        await this.reloadLocal((new Int8Array(Object.values(db))).buffer);
    }
}

export default ApiDatabaseManager;
