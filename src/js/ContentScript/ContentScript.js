/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 12/10/18
 * Time: 18:09
 */

import { MSG_GET_FORM_DATA, MSG_FORM_DATA_RECEIVED, MSG_SAVE_PASS, NAME_REGEXP, PASSWD_REGEXP, MSG_BEFORE_UNLOAD, MSG_GET_PASSWORD } from '../constants';
import selectorGenerator from './SelectorGenerator';
import savePopup from './SavePopup';

class ContentScript {

    constructor() {
        this.checkPasswordField();
        this.initListeners();
        this.initLoad();
    }

    checkPasswordField() {

        chrome.runtime.sendMessage({type: MSG_GET_PASSWORD, url: document.location.href}, (data) => {
            const item = data[0]; // temporary take the first one

            const { nameSelector, passwordSelector } = item.selectors;

            const nameField = document.querySelector(nameSelector);
            const passwordField = document.querySelector(passwordSelector);

            if (nameField && passwordField) {
                nameField.value = item.name;
                passwordField.value = item.password;
            }
        });
    }

    initListeners() {
        chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
            switch (data.type) {
                case MSG_FORM_DATA_RECEIVED: this.onFormDataReceived(data, sender, sendResponse); break;
            }
        });

        window.addEventListener("beforeunload", (event) => {
            const inputs = [];
            [
                ...document.querySelectorAll("input[type='text']"),
                ...document.querySelectorAll("input[type='email']"),
                ...document.querySelectorAll("input[type='password']"),
            ].forEach(item => {
                if (NAME_REGEXP.test(item.name) || PASSWD_REGEXP.test(item.name)) {
                    inputs.push({
                        name: item.name,
                        value: item.value,
                        selector: selectorGenerator.getQuerySelector(item)
                    });
                }
            });

            if (Object.keys(inputs).length > 0) {
                chrome.runtime.sendMessage({type: MSG_BEFORE_UNLOAD, inputs}, () => {});
            }
        });
    }

    initLoad() {
        const reloading = sessionStorage.getItem('reloading');

        if (reloading) {
            sessionStorage.removeItem('reloading');
            chrome.runtime.sendMessage({type: MSG_GET_FORM_DATA}, (data) => savePopup.show(data, () => {
                chrome.runtime.sendMessage({type: MSG_SAVE_PASS});
            }));
        }
    }

    onFormDataReceived(data, sender, sendResponse) {
        sessionStorage.setItem('reloading', '1');
    }
}

new ContentScript();