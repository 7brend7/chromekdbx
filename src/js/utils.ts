/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 12/14/18
 * Time: 11:37
 */

export const getTranslation = (text: string): string => chrome.i18n.getMessage(text)

export const template = (tpl: string, data: { [key: string]: string }): string => {
    const re = /{{([^}}]+)?}}/g
    let match
    let result = tpl

    // eslint-disable-next-line no-cond-assign
    while ((match = re.exec(tpl))) {
        result = result.replace(match[0], data[match[1]])
    }
    return result
}
