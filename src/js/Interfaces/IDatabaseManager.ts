import { Entry, Kdbx, KdbxUuid } from 'kdbxweb'
import PageItem from '../PageItem'
import PopupItem from './PopupItem'

export default interface IDatabaseManager {
    reset(): void

    clear(): Promise<void>

    getBinary(): Promise<ArrayBuffer>

    addIcon(data: ArrayBuffer): Promise<KdbxUuid>

    addItem(pageItem: PageItem): Promise<void>

    findItemByHost(host: string): Promise<Entry[]>

    getAll(): Promise<PopupItem[]>

    deleteItem(id: string): Promise<void>

    getDb(): Promise<Kdbx>

    getItem(id: string): Promise<Entry>
}
