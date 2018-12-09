/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 11/20/18
 * Time: 18:36
 */

const { webRequest } = chrome;

class ListenersManager {


    constructor() {
        chrome.runtime.onInstalled.addListener(this.onInstalled);
        webRequest.onBeforeRequest.addListener(
            this.onBeforeRequest,
            {urls: ["<all_urls>"]},
            ["requestBody"]
        );
    }

    onInstalled() {
        const url_string = chrome.extension.getURL('views/start.html');
        chrome.tabs.create({active: true, url: url_string});
    }

    onBeforeRequest(details) {
        console.log(details);
    }
}

export default new ListenersManager();