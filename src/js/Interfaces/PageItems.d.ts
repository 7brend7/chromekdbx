/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 2019-09-30
 * Time: 10:34
 */

type PageItem = {
    passwordField: HTMLInputElement,
    nameField: HTMLInputElement,
};

export default PageItem;

declare global {
    interface Window {
        chromeKdbxPageItems: PageItem[];
    }
}