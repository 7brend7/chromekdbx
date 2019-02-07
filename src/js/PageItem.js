/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 1/15/19
 * Time: 10:41
 */

export default class PageItem {

    /**
     * @type {?string}
     */
    #name = null;

    /**
     * @type {?string}
     */
    #password = null;

    /**
     * @type {?string}
     */
    #url = null;

    /**
     * @type {?string}
     */
    #title = null;

    /**
     * @type {Object}
     */
    #meta = {};

    /**
     * @type {?string}
     */
    #icon = null;

    /**
     * @type {boolean}
     */
    #isCustom = false;

    getName() {
        return this.#name;
    }

    getPassword() {
        return this.#password;
    }

    getUrl() {
        return this.#url;
    }

    setName(value) {
        this.#name = value;
        return this;
    }

    setPassword(value) {
        this.#password = value;
        return this;
    }

    setUrl(value) {
        this.#url = value;
        return this;
    }

    setTitle(value) {
        this.#title = value;
        return this;
    }

    setIcon(value) {
        this.#icon = value;
        return this;
    }

    setCustom(value) {
        this.#isCustom = value;
        return this;
    }

    /**
     * @param {string} key
     * @param value
     */
    setMeta(key, value) {
        if (value === null && this.#meta.key) {
            delete this.#meta.key;
        }

        this.#meta[key] = value;

        return this;
    }

    serializeMeta() {
        return JSON.stringify(this.#meta);
    }

    /**
     * @param {KdbxEntry} entry
     * @param {KdbxMeta} meta
     */
    fillEntry(entry, meta) {
        /* eslint-disable no-param-reassign */
        entry._setField('UserName', this.#name);
        entry._setField('Password', this.#password, meta.memoryProtection.password);
        entry._setField('URL', this.#url, meta.memoryProtection.url);
        entry._setField('Title', this.#title);
        entry._setField('chrome_kdbx', this.serializeMeta(), true);
        this.#icon && (entry.customIcon = this.#icon);

        /* eslint-enable */
    }

    isCustom() {
        return this.#isCustom;
    }

}
