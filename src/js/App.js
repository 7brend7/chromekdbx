import databaseManager from './DatabaseManager';
import {
    MSG_BEFORE_UNLOAD,
    MSG_FORM_DATA_RECEIVED,
    MSG_GET_FORM_DATA,
    MSG_SAVE_PASS,
    NAME_REGEXP,
    PASSWD_REGEXP,
    MSG_GET_PASSWORD,
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
                case MSG_BEFORE_UNLOAD: return this.beforeUnload(data, sender, sendResponse);
                case MSG_GET_PASSWORD: return this.getPasword(data, sender, sendResponse);
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

            if (Object.keys(loginForm).length === 2) {
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

            databaseManager.addItem(pageData);
            delete this.data[sender.tab.id];
        }
    }

    beforeUnload(data, sender, sendResponse) {
        this.data[sender.tab.id] = {
            ...this.data[sender.tab.id],
            inputs: data.inputs,
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
}

export default new App();
