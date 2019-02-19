import databaseManager from './DatabaseManager';

/* eslint-disable no-unused-vars */
import {
    MSG_GET_FORM_DATA,
    MSG_SAVE_PASS,
    MSG_GET_PASSWORD,
    MSG_GET_ALL_PASSWORD,
    MSG_CLEAR,
    MSG_DELETE_PASSWORD,
    MSG_DOWNLOAD,
    MSG_SET_CUSTOM_CONTENT,
    MSG_CHECK_PAGE_ITEM,
} from './constants';
/* eslint-enable */

import PageItem from './PageItem';

class App {

    constructor() {
        this.data = {};
        this.pageFields = {};

        this.initListeners();
    }

    initListeners() {
        chrome.runtime.onInstalled.addListener(this.onInstalled);

        chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
            const funcName = data.type.replace(/^MSG_/, '').toLowerCase().replace(/(_[a-z])/g, (match, p1) => p1.replace('_', '').toUpperCase());
            return (typeof this[funcName] === 'function') ? this[funcName](data, sender, sendResponse) : null;
        });
    }

    onInstalled() {
        const urlString = chrome.extension.getURL('views/start.html');
        chrome.tabs.create({ active: true, url: urlString });
    }

    /**
     * @param {PageItem} pageItem
     * @returns {Promise<boolean>}
     */
    checkPasswordExist(pageItem) {
        return new Promise((res) => {
            this.getPassword({ url: pageItem.getUrl() }, null, (items) => {
                res(items.filter(item => item.name === pageItem.getName() && item.password === pageItem.getPassword()).length > 0);
            });
        });
    }

    /**
     * @param tabId
     * @returns {PageItem}
     */
    getPageItem(tabId) {
        !this.data[tabId] && (this.data[tabId] = new PageItem());

        return this.data[tabId];
    }

    clearPageItem(tabId) {
        this.data[tabId] && (delete this.data[tabId]);
        this.pageFields[tabId] && (delete this.pageFields[tabId]);
    }

    getPageFields(tabId) {
        !this.pageFields[tabId] && (this.pageFields[tabId] = []);

        return this.pageFields[tabId];
    }

    /**
     * @see MSG_GET_FORM_DATA
     *
     * @param data
     * @param sender
     * @param {function} sendResponse
     */
    getFormData(data, sender, sendResponse) {
        typeof sendResponse === 'function' && (sendResponse(this.getPageItem(sender.tab.id)));
    }

    /**
     * @see MSG_SAVE_PASS
     *
     * @param data
     * @param sender
     */
    savePass(data, sender) {
        const pageItem = this.getPageItem(sender.tab.id);
        const pageFields = this.getPageFields(sender.tab.id);

        const nameField = pageFields.find(item => item.value === pageItem.getName());
        nameField && (pageItem.setMeta('nameSelector', nameField.selector));

        const passwordField = pageFields.find(item => item.value === pageItem.getPassword());
        nameField && (pageItem.setMeta('passwordSelector', passwordField.selector));

        const addItem = () => {
            databaseManager.addItem(pageItem);
            this.clearPageItem(sender.tab.id);
        };

        if (sender.tab.favIconUrl) {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', sender.tab.favIconUrl, true);
            xhr.responseType = 'arraybuffer';
            xhr.onload = async () => {
                const id = await databaseManager.addIcon(xhr.response);
                pageItem.setIcon(id);
                addItem();
            };
            xhr.onerror = () => {
                addItem();
            };
            xhr.send();
        } else {
            addItem();
        }
    }

    /**
     * @see MSG_GET_PASSWORD
     *
     * @param data
     * @param sender
     * @param sendResponse
     * @returns {boolean}
     */
    getPassword(data, sender, sendResponse) {
        const url = new URL(data.url);
        databaseManager.findItemByHost(url.host).then((items) => {
            typeof sendResponse === 'function' && sendResponse(items.map((item) => {
                const { fields } = item;
                return {
                    name: fields.UserName,
                    password: fields.Password.getText(),
                    selectors: JSON.parse(fields.chrome_kdbx.getText()),
                };
            }));
        });

        return true;
    }

    /**
     * @see MSG_GET_ALL_PASSWORD
     *
     * @param data
     * @param sender
     * @param sendResponse
     * @returns {boolean}
     */
    getAllPassword(data, sender, sendResponse) {
        databaseManager.getAll().then(allPasswords => sendResponse(allPasswords));
        return true;
    }

    /**
     * @see MSG_CLEAR
     *
     * @param data
     * @param sender
     */
    clear(data, sender) {
        this.clearPageItem(sender.tab.id);
    }

    /**
     * @see MSG_DELETE_PASSWORD
     *
     * @param data
     * @param sender
     * @param sendResponse
     * @returns {boolean}
     */
    deletePassword(data, sender, sendResponse) {
        databaseManager.deleteItem(data.id).then(() => {
            databaseManager.getAll().then(allPasswords => sendResponse(allPasswords));
        });

        return true;
    }

    /**
     * @see MSG_DOWNLOAD
     *
     * @param data
     * @param sender
     * @param sendResponse
     * @returns {boolean}
     */
    download(data, sender, sendResponse) {
        databaseManager.reset();
        databaseManager.getBinary().then((db) => {
            sendResponse(URL.createObjectURL(new Blob([db], { type: data.blobType })));
        });

        return true;
    }

    /**
     * @see MSG_SET_CUSTOM_CONTENT
     *
     * @param data
     * @param sender
     */
    setCustomContent(data, sender) {
        if (data.name !== '' && data.password !== '') {
            const pageItem = this.getPageItem(sender.tab.id);

            pageItem
                .setName(data.name)
                .setPassword(data.password)
                .setUrl(data.url)
                .setTitle(data.title)
                .setMeta('nameSelector', data.nameSelector)
                .setMeta('passwordSelector', data.passwordSelector);

            this.checkPasswordExist(pageItem).then((exist) => {
                exist && this.clearPageItem(sender.tab.id);
            });
        }
    }

    /**
     * @see MSG_CHECK_PAGE_ITEM
     *
     * @param data
     * @param sender
     * @param sendResponse
     */
    checkPageItem(data, sender, sendResponse) {
        sendResponse(!!this.data[sender.tab.id]);
        return true;
    }

}

export default new App();
