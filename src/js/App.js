import databaseManager from './DatabaseManager';
import {
    MSG_SET_DATA,
    MSG_FORM_DATA_RECEIVED,
    MSG_GET_FORM_DATA,
    MSG_SAVE_PASS,
    NAME_REGEXP,
    PASSWD_REGEXP,
    MSG_GET_PASSWORD,
    MSG_GET_ALL_PASSWORD,
    MSG_CLEAR,
    MSG_DELETE_PASSWORD,
    MSG_DOWNLOAD,
} from "./constants";

class App {

    constructor() {
        this.data = {};

        this.initListeners();
    }

    initListeners() {
        const { webRequest } = chrome;

        chrome.runtime.onInstalled.addListener(this.onInstalled);

        webRequest.onBeforeRequest.addListener(
            this.onBeforeRequest.bind(this),
            {urls: ["<all_urls>"]},
            ["requestBody"]
        );

        chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
            switch (data.type) {
                case MSG_GET_FORM_DATA: return this.getFormData(data, sender, sendResponse);
                case MSG_SAVE_PASS: return this.savePassword(data, sender, sendResponse);
                case MSG_SET_DATA: return this.setData(data, sender, sendResponse);
                case MSG_GET_PASSWORD: return this.getPasword(data, sender, sendResponse);
                case MSG_GET_ALL_PASSWORD: return this.getAllPassword(data, sender, sendResponse);
                case MSG_CLEAR: return this.clear(data, sender, sendResponse);
                case MSG_DELETE_PASSWORD: return this.deletePassword(data, sender, sendResponse);
                case MSG_DOWNLOAD: return this.download(data, sender, sendResponse);
            }
        });
    }

    onInstalled() {
        const url_string = chrome.extension.getURL('views/start.html');
        chrome.tabs.create({active: true, url: url_string});
    }

    onBeforeRequest(details) {

        const methodsToCheck = ['POST', 'PUT'];

        if (methodsToCheck.includes(details.method) && details.requestBody) {
            const {formData} = details.requestBody;

            let loginForm = {};

            if (formData) {
                for (let name in formData) {
                    if (NAME_REGEXP.test(name)) {
                        loginForm.name = formData[name][0];
                    }
                    if (PASSWD_REGEXP.test(name)) {
                        loginForm.password = formData[name][0];
                    }
                }
            }

            if (Object.keys(loginForm).length === 2 && !this.data[details.tabId].custom) {
                chrome.tabs.get(details.tabId, tab => {

                    const url = new URL(tab.url);

                    this.data[details.tabId] = {
                        ...this.data[details.tabId],
                        url: url.origin + url.pathname,
                        title: tab.title,
                        ...loginForm
                    };

                    chrome.tabs.sendMessage(details.tabId, {type: MSG_FORM_DATA_RECEIVED}, () => {});
                });
            }
        }
    }

    getFormData(data, sender, sendResponse) {
        if (this.data[sender.tab.id] && typeof sendResponse === 'function') {
            sendResponse(this.data[sender.tab.id]);
        }
    }

    savePassword(data, sender, sendResponse) {
        if (this.data[sender.tab.id] && typeof sendResponse === 'function') {
            const pageData = this.data[sender.tab.id];
            const { inputs } = pageData;
            delete pageData.inputs;
            pageData.meta = {};

            inputs.forEach(item => {
                if (item.value === pageData.name) {
                    pageData.meta.nameSelector = item.selector;
                }

                if (item.value === pageData.password) {
                    pageData.meta.passwordSelector = item.selector;
                }
            });

            pageData.meta = JSON.stringify(pageData.meta);

            const xhr = new XMLHttpRequest();
            xhr.open( "GET", sender.tab.favIconUrl, true );
            xhr.responseType = 'arraybuffer';
            xhr.onload = ( e )  => {
                databaseManager.addIcon(xhr.response).then(id => {
                    pageData.icon = id;
                    databaseManager.addItem(pageData);
                    delete this.data[sender.tab.id];
                });
            };
            xhr.onerror = () => {
                databaseManager.addItem(pageData);
                delete this.data[sender.tab.id];
            };
            xhr.send();
        }
    }

    setData(data, sender, sendResponse) {
        delete data.type;

        this.data[sender.tab.id] = {
            ...this.data[sender.tab.id],
            ...data,
        }
    }

    getPasword(data, sender, sendResponse) {
        const url = new URL(data.url);
        databaseManager.findItemByHost(url.host).then(items => {
            if (items.length > 0 && typeof sendResponse === 'function') {
                sendResponse(items.map(item => {
                    const { fields } = item;
                    return {
                        name: fields.UserName,
                        password: fields.Password.getText(),
                        selectors: JSON.parse(fields.chrome_kdbx.getText())
                    }
                }));
            }
        });

        return true;
    }

    getAllPassword(data, sender, sendResponse) {
        databaseManager.getAll().then(data => sendResponse(data));
        return true;
    }

    clear(data, sender, sendResponse) {
        if (this.data[sender.tab.id]) {
            delete this.data[sender.tab.id];
        }
    }

    deletePassword(data, sender, sendResponse) {
        databaseManager.deleteItem(data.id).then(() => {
            databaseManager.getAll().then(data => sendResponse(data));
        });

        return true;
    }

    download(data, sender, sendResponse) {
        databaseManager.reset();
        databaseManager.getBinary().then(db => {
            sendResponse(URL.createObjectURL(new Blob([db], {type: data.blobType})));
        });

        return true;
    }
}

export default new App();
