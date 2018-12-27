/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 12/14/18
 * Time: 11:37
 */

export const getTranslation = (text) => chrome.i18n.getMessage(text);

export const template = (tpl, data) => {
    let re = /{{([^}}]+)?}}/g, match;
    while(match = re.exec(tpl)) {
        tpl = tpl.replace(match[0], data[match[1]])
    }
    return tpl;
}