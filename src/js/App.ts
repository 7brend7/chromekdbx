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

import { Entry, ProtectedValue } from 'kdbxweb';
import databaseManager from './DatabaseManager';
import PageItem from './PageItem';
import PasswordItem from './Interfaces/PasswordItem';
import PopupItem from './Interfaces/PopupItem';

type MessageSender = chrome.runtime.MessageSender;

class App {

    /**
     * Collection with passwords fields per tab
     *
     * @type {{}}
     */
    private data: {
        [key: number]: PageItem,
    } = {};

    /**
     * App constructor
     */
    constructor() {
        this.initListeners();
    }

    /**
     * Note! Dynamic method names
     *
     * Register message listeners
     */
    initListeners(): void {
        chrome.runtime.onInstalled.addListener(this.onInstalled);

        chrome.runtime.onMessage.addListener((data: any, sender: MessageSender, sendResponse: (response?: any) => void) => {
            const funcName = data.type.replace(/^MSG_/, '').toLowerCase().replace(/(_[a-z])/g, (match: string, p1: string) => p1.replace('_', '').toUpperCase());
            (typeof (this as any)[funcName] === 'function') && ((this as any)[funcName](data, sender, sendResponse));
            return typeof sendResponse === 'function' ? true : null;
        });
    }

    /**
     * Show start page
     */
    onInstalled(): void {
        const urlString = chrome.extension.getURL('views/start.html');
        chrome.tabs.create({ active: true, url: urlString });
    }

    /**
     * @param {PageItem} pageItem
     * @returns {Promise<boolean>}
     */
    checkPasswordExist(pageItem: PageItem): Promise<boolean> {
        return new Promise<boolean>((res) => {
            this.getPassword({ url: pageItem.getUrl() }, null, (items: PasswordItem[]) => {
                res(items.filter(item => item.name === pageItem.getName() && item.password === pageItem.getPassword()).length > 0);
            });
        });
    }

    /**
     * @param tabId
     * @returns {PageItem}
     */
    getPageItem(tabId: number): PageItem {
        !this.data[tabId] && (this.data[tabId] = new PageItem());

        return this.data[tabId];
    }

    /**
     * @param {number} tabId
     */
    clearPageItem(tabId: number): void {
        this.data[tabId] && (delete this.data[tabId]);
    }

    /**
     * @param {chrome.runtime.MessageSender} sender
     * @returns {number}
     */
    getTabId(sender: MessageSender): number {
        let res = 0;

        sender.tab && sender.tab.id && (res = sender.tab.id);

        return res;
    }

    /**
     * @see MSG_GET_FORM_DATA
     *
     * @param data
     * @param sender
     * @param {function} sendResponse
     */
    getFormData(data: any, sender: MessageSender, sendResponse: (response?: any) => void): void {
        typeof sendResponse === 'function' && (sendResponse(this.getPageItem(this.getTabId(sender))));
    }

    /**
     * @see MSG_SAVE_PASS
     *
     * @param data
     * @param sender
     */
    savePass(data: any, sender: MessageSender): void {
        const pageItem = this.getPageItem(this.getTabId(sender));

        const addItem = () => {
            databaseManager.addItem(pageItem);
            this.clearPageItem(this.getTabId(sender));
        };

        if (sender.tab && sender.tab.favIconUrl) {
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
     */
    getPassword(data: any, sender: MessageSender | null, sendResponse: (response?: any) => void): void {
        const url = new URL(data.url);
        databaseManager.findItemByHost(url.host).then((items: Entry[]) => {
            typeof sendResponse === 'function' && sendResponse(items.map((item: Entry) => {
                const { fields } = item;
                const password: string = fields.Password instanceof ProtectedValue ? fields.Password.getText() : fields.Password;
                const selectors: string = fields.chrome_kdbx instanceof ProtectedValue ? fields.chrome_kdbx.getText() : fields.chrome_kdbx;

                return {
                    password,
                    name: fields.UserName,
                    selectors: JSON.parse(selectors),
                };
            }));
        });
    }

    /**
     * @see MSG_GET_ALL_PASSWORD
     *
     * @param data
     * @param sender
     * @param sendResponse
     */
    getAllPassword(data: any, sender: MessageSender, sendResponse: (response?: any) => void): void {
        databaseManager.getAll().then((allPasswords: PopupItem[]) => sendResponse(allPasswords));
    }

    /**
     * @see MSG_CLEAR
     *
     * @param data
     * @param sender
     */
    clear(data: any, sender: MessageSender): void {
        this.clearPageItem(this.getTabId(sender));
    }

    /**
     * @see MSG_DELETE_PASSWORD
     *
     * @param data
     * @param sender
     * @param sendResponse
     */
    deletePassword(data: any, sender: MessageSender, sendResponse: (response?: any) => void): void {
        databaseManager.deleteItem(data.id).then(() => {
            databaseManager.getAll().then((allPasswords: PopupItem[]) => sendResponse(allPasswords));
        });
    }

    /**
     * @see MSG_DOWNLOAD
     *
     * @param data
     * @param sender
     * @param sendResponse
     */
    download(data: any, sender: MessageSender, sendResponse: (response?: any) => void): void {
        databaseManager.reset();
        databaseManager.getBinary().then((db: ArrayBuffer) => {
            sendResponse(URL.createObjectURL(new Blob([db], { type: data.blobType })));
        });
    }

    /**
     * @see MSG_SET_CUSTOM_CONTENT
     *
     * @param data
     * @param sender
     */
    setCustomContent(data: any, sender: MessageSender): void {
        if (data.name !== '' && data.password !== '') {
            const pageItem = this.getPageItem(this.getTabId(sender));

            pageItem
                .setName(data.name)
                .setPassword(data.password)
                .setUrl(data.url)
                .setTitle(data.title)
                .setMeta('nameSelector', data.nameSelector)
                .setMeta('passwordSelector', data.passwordSelector);

            this.checkPasswordExist(pageItem).then((exist: boolean) => {
                exist && this.clearPageItem(this.getTabId(sender));
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
    checkPageItem(data: any, sender: MessageSender, sendResponse: (response: boolean) => void): void {
        sendResponse(!!this.data[this.getTabId(sender)]);
    }

}

export default new App();
