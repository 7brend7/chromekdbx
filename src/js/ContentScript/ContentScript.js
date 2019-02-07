/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 12/10/18
 * Time: 18:09
 */

import {
    MSG_GET_FORM_DATA,
    MSG_FORM_DATA_RECEIVED,
    MSG_SAVE_PASS,
    NAME_REGEXP,
    PASSWD_REGEXP,
    MSG_GET_PASSWORD,
    MSG_CLEAR,
    MSG_SET_CUSTOM,
    MSG_SET_CUSTOM_CONTENT,
    MSG_SET_SELECTORS,
} from '../constants';
import customScripts from '../custom_scripts';
import selectorGenerator from './SelectorGenerator';
import savePopup from './SavePopup';

class ContentScript {

    constructor() {
        this.customScript = this.checkCustomScripts();

        this.checkPasswordField();
        this.initListeners();
        this.initLoad();
    }

    checkPasswordField() {
        chrome.runtime.sendMessage({ type: MSG_GET_PASSWORD, url: document.location.href }, (data) => {
            if (data.length > 0) {
                const item = data[0]; // temporary take the first one

                const { nameSelector, passwordSelector } = item.selectors;

                const nameField = document.querySelector(nameSelector);
                const passwordField = document.querySelector(passwordSelector);

                if (nameField && passwordField) {
                    nameField.value = item.name;
                    passwordField.value = item.password;
                }
            }
        });
    }

    initListeners() {
        chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
            switch (data.type) {
                case MSG_FORM_DATA_RECEIVED:
                    this.onFormDataReceived(data, sender, sendResponse);
                    break;
                default: break;
            }
        });

        window.addEventListener('beforeunload', this.beforeunload.bind(this));

        if (this.customScript) {
            chrome.runtime.sendMessage({ type: MSG_SET_CUSTOM, custom: true });

            const nameFiled = document.querySelector(this.customScript.fields.name);
            const passwordFiled = document.querySelector(this.customScript.fields.password);

            if (nameFiled && passwordFiled) {
                this.customScript.name = nameFiled.value;
                this.customScript.password = passwordFiled.value;

                nameFiled.addEventListener('change', e => this.customScript.name = e.target.value);
                passwordFiled.addEventListener('change', e => this.customScript.password = e.target.value);
            }
        }
    }

    initLoad() {
        const reloading = sessionStorage.getItem('reloading');

        if (reloading) {
            sessionStorage.removeItem('reloading');
            this.showPopup();
        }
    }

    onFormDataReceived() {
        sessionStorage.setItem('reloading', '1');
    }

    showPopup() {
        chrome.runtime.sendMessage({ type: MSG_GET_FORM_DATA }, (pageItem) => {
            savePopup.show(pageItem, () => {
                chrome.runtime.sendMessage({ type: MSG_SAVE_PASS });
            }, () => {
                chrome.runtime.sendMessage({ type: MSG_CLEAR });
            });
        });
    }

    checkCustomScripts() {
        const url = new URL(document.location.href);

        if (customScripts.find(item => item.host === url.host)) {
            this.showPopup();
        }

        return customScripts.find((item) => {
            const checkHost = item.fieldsHost || item.host;

            return checkHost === url.host;
        });
    }

    beforeunloadCustom() {
        chrome.runtime.sendMessage({
            type: MSG_SET_CUSTOM_CONTENT,
            name: this.customScript.name,
            password: this.customScript.password,
            url: document.location.href,
            title: document.title,
            nameSelector: this.customScript.fields.name,
            passwordSelector: this.customScript.fields.password,
        });
    }

    beforeunload() {
        if (this.customScript) {
            this.beforeunloadCustom();
            return true;
        }

        const pageFields = [];
        [
            ...document.querySelectorAll("input[type='text']"),
            ...document.querySelectorAll("input[type='email']"),
            ...document.querySelectorAll("input[type='password']"),
        ].forEach((item) => {
            if (NAME_REGEXP.test(item.name) || PASSWD_REGEXP.test(item.name)) {
                pageFields.push({
                    selector: selectorGenerator.getQuerySelector(item),
                    value: item.value,
                });
            }
        });

        if (Object.keys(pageFields).length > 0) {
            chrome.runtime.sendMessage({
                type: MSG_SET_SELECTORS,
                pageFields,
            });
        }

        return true;
    }

}

new ContentScript(); // eslint-disable-line no-new
