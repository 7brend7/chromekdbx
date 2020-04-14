import {
    Credentials, Entry, Group, Kdbx, KdbxUuid,
} from 'kdbxweb'
import PageItem from '../PageItem'
import PopupItem from './PopupItem'
import ApiEntry from './ApiEntry'

export default interface IDatabaseManager {

    reset(): void

    clear(): Promise<void>

    getBinary(): Promise<ArrayBuffer>

    addIcon(data: ArrayBuffer): Promise<KdbxUuid>

    addItem(pageItem: PageItem): Promise<void>

    findItemByHost(host: string): Promise<ApiEntry[]>

    getAll(): Promise<PopupItem[]>

    deleteItem(id: string): Promise<void>

    getDb(): Promise<Kdbx>
}
