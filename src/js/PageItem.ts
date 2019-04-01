/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 1/15/19
 * Time: 10:41
 */
import { Entry, KdbxUuid, Meta, ProtectedValue } from 'kdbxweb';

export default class PageItem {

    private name: string = '';

    private password: string = '';

    private url: string = '';

    private title: string = '';

    private meta: {
        [key: string]: any,
    } = {};

    private icon: KdbxUuid | null = null;

    getName(): string {
        return this.name;
    }

    getPassword(): string {
        return this.password;
    }

    getUrl(): string {
        return this.url;
    }

    setName(value: string): PageItem {
        this.name = value;
        return this;
    }

    setPassword(value: string): PageItem {
        this.password = value;
        return this;
    }

    setUrl(value: string): PageItem {
        this.url = value;
        return this;
    }

    setTitle(value: string): PageItem {
        this.title = value;
        return this;
    }

    setIcon(value: KdbxUuid): PageItem {
        this.icon = value;
        return this;
    }

    setMeta(key: string, value: any): PageItem {
        if (value === null && this.meta.key) {
            delete this.meta.key;
        }

        this.meta[key] = value;

        return this;
    }

    serializeMeta(): string {
        return JSON.stringify(this.meta);
    }

    /**
     * @param {Entry} entry
     * @param {Meta} meta
     */
    fillEntry(entry: Entry, meta: Meta) {
        /* eslint-disable no-param-reassign */
        entry.fields['UserName'] = this.name;
        entry.fields['Password'] = meta.memoryProtection.password ? ProtectedValue.fromString(this.password) : this.password;
        entry.fields['URL'] = meta.memoryProtection.url ? ProtectedValue.fromString(this.url) : this.url;
        entry.fields['Title'] = this.title;
        entry.fields['chrome_kdbx'] = ProtectedValue.fromString(this.serializeMeta());

        this.icon && (entry.customIcon = this.icon);

        /* eslint-enable */
    }

}
