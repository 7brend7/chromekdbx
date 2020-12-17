import kdbxweb, { Credentials, Entry, Kdbx, KdbxUuid } from 'kdbxweb'
import ApiManager from './ApiManager'
import PopupItem from './Interfaces/PopupItem'
import PageItem from './PageItem'
import IDatabaseManager from './Interfaces/IDatabaseManager'
import LocalDatabaseManager from './LocalDatabaseManager'
import DbConnector from './DbConnector'
import PasswordManager from './PasswordManager'

class ApiDatabaseManager implements IDatabaseManager {
    private apiManager: ApiManager = new ApiManager()

    private credentials: Credentials | null = null

    private databaseManager: LocalDatabaseManager | null = null

    async initPasswd() {
        const passwd = await PasswordManager.get()
        this.credentials = new kdbxweb.Credentials(passwd, '')
    }

    async getDbManager(): Promise<LocalDatabaseManager> {
        if (!this.databaseManager) {
            await this.reloadLocal()
        }
        if (!this.databaseManager) {
            throw new Error('no initialized database')
        }

        return this.databaseManager
    }

    async getAll(): Promise<PopupItem[]> {
        return (await this.getDbManager()).getAll()
    }

    async findItemByHost(host: string): Promise<Entry[]> {
        return (await this.getDbManager()).findItemByHost(host)
    }

    async addIcon(data: ArrayBuffer): Promise<KdbxUuid> {
        return (await this.getDbManager()).addIcon(data)
    }

    async getDb(): Promise<Kdbx> {
        return (await this.getDbManager()).getDb()
    }

    reset(): void {
        console.log('reset')
    }

    async clear(): Promise<void> {
        return this.apiManager.clear()
    }

    async connect(name: string, password: string): Promise<void> {
        await PasswordManager.set(password)

        return this.apiManager.connect(name, password)
    }

    async getBinary(): Promise<ArrayBuffer> {
        return this.apiManager.getBinary()
    }

    async addItem(pageItem: PageItem): Promise<void> {
        await (await this.getDbManager()).addItem(pageItem)
        await this.saveDb()
    }

    async deleteItem(id: string): Promise<void> {
        await (await this.getDbManager()).deleteItem(id)
        await this.saveDb()
    }

    async reloadLocal(dataInput: ArrayBuffer | null = null): Promise<void> {
        if (!this.credentials) {
            await this.initPasswd()
        }

        const connector = new DbConnector()
        try {
            const data = dataInput || (await this.getBinary())
            await connector.saveDb(data)
        } catch (e) {
            console.warn('Cannot get binary data')
        }
        this.databaseManager = new LocalDatabaseManager(connector)
    }

    async getFreshDb(): Promise<PopupItem[]> {
        const db: ArrayBuffer = await this.apiManager.getBinary()
        await this.reloadLocal(db)
        return this.getAll()
    }

    async saveDb(): Promise<void> {
        const db: ArrayBuffer = await (await this.getDbManager()).getBinary()
        await this.apiManager.saveDb(db)
    }

    async getItem(id: string): Promise<Entry> {
        return (await this.getDbManager()).getItem(id)
    }
}

export default ApiDatabaseManager
