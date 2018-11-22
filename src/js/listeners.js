/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 11/20/18
 * Time: 18:36
 */

chrome.runtime.onInstalled.addListener(() => {
    const url_string = chrome.extension.getURL('views/start.html');
    chrome.tabs.create({active: true, url: url_string});
});