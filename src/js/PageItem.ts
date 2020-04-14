/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 1/15/19
 * Time: 10:41
 */
import {
    Entry, KdbxUuid, Meta, ProtectedValue,
} from 'kdbxweb'

export default class PageItem {
    private name: string = ''

    private password: string = ''

    private url: string = ''

    private title: string = ''

    private meta: {
        [key: string]: any,
    } = {}

    private icon: KdbxUuid | null = null

    getName(): string {
        return this.name
    }

    getPassword(): string {
        return this.password
    }

    getUrl(): string {
        return this.url
    }

    setName(value: string): PageItem {
        this.name = value
        return this
    }

    setPassword(value: string): PageItem {
        this.password = value
        return this
    }

    setUrl(value: string): PageItem {
        this.url = value
        return this
    }

    setTitle(value: string): PageItem {
        this.title = value
        return this
    }

    setIcon(value: KdbxUuid): PageItem {
        this.icon = value
        return this
    }

    setMeta(key: string, value: string): PageItem {
        if (value === null && this.meta.key) {
            delete this.meta.key
        }

        this.meta[key] = value

        return this
    }

    serializeMeta(): string {
        return JSON.stringify(this.meta)
    }

    /**
     * @param {Entry} entry
     * @param {Meta} meta
     */
    fillEntry(entry: Entry, meta: Meta) {
        /* eslint-disable no-param-reassign */
        entry.fields.UserName = this.name
        entry.fields.Password = meta.memoryProtection.password ? ProtectedValue.fromString(this.password) : this.password
        entry.fields.URL = meta.memoryProtection.url ? ProtectedValue.fromString(this.url) : this.url
        entry.fields.Title = this.title
        entry.fields.chrome_kdbx = ProtectedValue.fromString(this.serializeMeta())

        this.icon && (entry.customIcon = this.icon)

        /* eslint-enable */
    }

    toJson(): string {
        return JSON.stringify({
            name: this.getName(),
            password: this.getPassword(),
            url: this.getUrl(),
            title: this.title,
            meta: this.meta,
            icon: this.icon ? this.icon.toString() : null,
        })
    }

    static fromJson(data: string): PageItem | null {
        try {
            const dataObj = JSON.parse(data)

            const item = new PageItem()
            dataObj.name && item.setName(dataObj.name)
            dataObj.password && item.setPassword(dataObj.password)
            dataObj.url && item.setUrl(dataObj.url)
            dataObj.title && item.setTitle(dataObj.title)
            dataObj.meta && (item.meta = dataObj.meta)
            if (dataObj.icon) {
                const uuid = KdbxUuid.random()
                uuid.id = dataObj.icon
                uuid.empty = false
                item.setIcon(uuid)
            }

            return item
        } catch (e) {
            return null
        }
    }
}
