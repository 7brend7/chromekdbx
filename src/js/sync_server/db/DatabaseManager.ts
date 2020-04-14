import kdbxweb, { Credentials, Kdbx, ProtectedValue } from 'kdbxweb'
import Connection, { IConnectionDocument } from '../models/Connection'
import KdbxInstance, { IKdbxInstanceDocument } from '../models/KdbxInstance'
import LocalDatabaseManager from '../../LocalDatabaseManager'
import PopupItem from '../../Interfaces/PopupItem'
import IDatabaseManager from '../../Interfaces/IDatabaseManager'
import PageItem from '../../PageItem'
import DbConnector from './DbConnector'
import cklog from '../cklog'

class DatabaseManager {
    private connection: {
        [token: string]: IConnectionDocument;
    } = {}

    // private passwdValue: ProtectedValue | null = null;
    // private credentials: Credentials | null = null;
    private db: {
        [id: string]: LocalDatabaseManager;
    } = {}

    private async initNew(token: string): Promise<boolean> {
        if (!this.connection[token]) {
            throw new Error('No initialized connection')
        }
        const connection = this.connection[token]
        const credentials: Credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromBinary(connection.password), '')
        const data: Kdbx = Kdbx.create(credentials, connection.name)
        const kdbxInstance = new KdbxInstance({
            name: connection.name,
            content: new Buffer(await data.save()),
        })

        this.db[kdbxInstance.id] = new LocalDatabaseManager(new DbConnector(kdbxInstance, credentials))
        this.addRelations(connection, kdbxInstance)

        return true
    }

    addRelations(connection: IConnectionDocument, kdbxInstance: IKdbxInstanceDocument) {
        kdbxInstance.connections.push(connection)
        kdbxInstance.save()
        connection.kdbxInstance = kdbxInstance
        connection.save()
    }

    private async initExisted(token: string, kdbxInstance: IKdbxInstanceDocument): Promise<boolean> {
        if (!this.connection[token]) {
            throw new Error('No initialized connection')
        }

        const connection = this.connection[token]
        const passwdValue = kdbxweb.ProtectedValue.fromBinary(connection.password)
        const credentials = new kdbxweb.Credentials(passwdValue, '')

        this.db[kdbxInstance.id] = new LocalDatabaseManager(new DbConnector(kdbxInstance, credentials))

        try {
            await this.db[kdbxInstance.id].openDb()
        } catch (e) {
            cklog.error(e)
            delete this.db[kdbxInstance.id]
        }

        if (!connection.kdbxInstance) {
            this.addRelations(connection, kdbxInstance)
        }

        return true
    }

    async initConnection(token: string): Promise<IConnectionDocument | null> {
        const connection = await Connection.findOne({ token }) // .populate({ path: 'kdbxInstance', model: KdbxInstance })
        connection && this.setConnection(connection)
        return connection
    }

    setConnection(connection: IConnectionDocument): void {
        this.connection[connection.token] = connection
    }

    async initDb(token: string): Promise<boolean> {
        if (!this.connection[token]) {
            throw new Error('No initialized connection')
        }

        const id = this.connection[token].kdbxInstance.toString()
        let kdbxInstance = await KdbxInstance.findById(id)

        if (!kdbxInstance) {
            const kdbxInstanceGlobal = await KdbxInstance.findOne({ name: this.connection[token].name })
            kdbxInstanceGlobal && (kdbxInstance = kdbxInstanceGlobal)
        }
        (kdbxInstance) ? await this.initExisted(token, kdbxInstance) : await this.initNew(token)

        return true
    }

    async getDb(token: string): Promise<IDatabaseManager> {
        const id = this.connection[token].kdbxInstance.toString()

        if (!this.db || typeof this.db[id] === 'undefined') {
            if (this.connection[token] && this.connection[token].kdbxInstance) {
                const kdbxInstance: IKdbxInstanceDocument | null = await KdbxInstance.findById(id)
                kdbxInstance && await this.initExisted(token, kdbxInstance)
            } else {
                throw new Error('No initialized database')
            }
        }

        return this.db[id]
    }

    async setDb(db: ArrayBuffer, token: string): Promise<void> {
        if (!this.connection[token]) {
            throw new Error('No initialized connection')
        }

        const id = this.connection[token].kdbxInstance.toString()
        await KdbxInstance.update({ _id: id }, { content: new Buffer(db) })

        delete this.db[id]
    }

    async getBinary(token: string): Promise<ArrayBuffer> {
        return (await this.getDb(token)).getBinary()
    }

    async getAll(token: string): Promise<PopupItem[]> {
        return (await this.getDb(token)).getAll()
    }
}

export default new DatabaseManager()
