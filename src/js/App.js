import databaseManager from './DatabaseManager';

/* eslint-disable no-unused-vars */
import {
    MSG_FORM_DATA_RECEIVED,
    NAME_REGEXP,
    PASSWD_REGEXP,
    MSG_GET_FORM_DATA,
    MSG_SAVE_PASS,
    MSG_GET_PASSWORD,
    MSG_GET_ALL_PASSWORD,
    MSG_CLEAR,
    MSG_DELETE_PASSWORD,
    MSG_DOWNLOAD,
    MSG_SET_CUSTOM,
    MSG_SET_CUSTOM_CONTENT,
    MSG_SET_SELECTORS,
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
        const { webRequest } = chrome;

        chrome.runtime.onInstalled.addListener(this.onInstalled);

        webRequest.onBeforeRequest.addListener(
            this.onBeforeRequest.bind(this),
            { urls: ['<all_urls>'] },
            ['requestBody'],
        );

        chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
            const funcName = data.type.replace(/^MSG_/, '').toLowerCase().replace(/(_[a-z])/g, (match, p1) => p1.replace('_', '').toUpperCase());
            return (typeof this[funcName] === 'function') ? this[funcName](data, sender, sendResponse) : null;
        });
    }

    onInstalled() {
        const urlString = chrome.extension.getURL('views/start.html');
        chrome.tabs.create({ active: true, url: urlString });
    }

    onBeforeRequest(details) {
        const methodsToCheck = ['POST', 'PUT'];

        if (methodsToCheck.includes(details.method) && details.requestBody) {
            const { formData } = details.requestBody;

            const loginForm = {};

            if (formData) {
                formData.forEach((name) => {
                    if (NAME_REGEXP.test(name)) {
                        [loginForm.name] = formData[name];
                    }
                    if (PASSWD_REGEXP.test(name)) {
                        [loginForm.password] = formData[name];
                    }
                });
            }

            const pageItem = this.getPageItem(details.tabId);

            if (Object.keys(loginForm).length === 2 && !pageItem.isCustom()) {
                chrome.tabs.get(details.tabId, (tab) => {
                    const url = new URL(tab.url);

                    pageItem
                        .setName(loginForm.name)
                        .setPassword(loginForm.password)
                        .setUrl(url.origin + url.pathname)
                        .setTitle(tab.title);

                    this.checkPasswordExist(pageItem).then((exist) => {
                        !exist && chrome.tabs.sendMessage(details.tabId, { type: MSG_FORM_DATA_RECEIVED });
                    });
                });
            }
        }
    }

    /**
     * @param {PageItem} pageItem
     * @returns {Promise<boolean>}
     */
    checkPasswordExist(pageItem) {
        return new Promise((res) => {
            this.getPasword({ url: pageItem.getUrl() }, null, (items) => {
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

    getFormData(data, sender, sendResponse) {
        typeof sendResponse === 'function' && (sendResponse(this.getPageItem(sender.tab.id)));
    }

    savePass(data, sender, sendResponse) {
        if (typeof sendResponse === 'function') {
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
        }
    }

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

    getAllPassword(data, sender, sendResponse) {
        databaseManager.getAll().then(allPasswords => sendResponse(allPasswords));
        return true;
    }

    clear(data, sender) {
        this.clearPageItem(sender.tab.id);
    }

    deletePassword(data, sender, sendResponse) {
        databaseManager.deleteItem(data.id).then(() => {
            databaseManager.getAll().then(allPasswords => sendResponse(allPasswords));
        });

        return true;
    }

    download(data, sender, sendResponse) {
        databaseManager.reset();
        databaseManager.getBinary().then((db) => {
            sendResponse(URL.createObjectURL(new Blob([db], { type: data.blobType })));
        });

        return true;
    }

    setCustom(data, sender) {
        this.getPageItem(sender.tab.id).setCustom(data.custom);
    }

    setCustomContent(data, sender) {
        const pageItem = this.getPageItem(sender.tab.id);

        pageItem
            .setName(data.name)
            .setPassword(data.password)
            .setUrl(data.url)
            .setTitle(data.title)
            .setMeta('nameSelector', data.nameSelector)
            .setMeta('passwordSelector', data.passwordSelector);
    }

    setSelectors(data, sender) {
        this.getPageFields(sender.tab.id).push(...data.pageFields);
    }

}

export default new App();
