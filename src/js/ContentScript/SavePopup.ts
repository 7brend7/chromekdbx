/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 27/12/18
 * Time: 15:07
 */

import { getTranslation, template } from '../utils'
import savePoppup from '../components/SavePopup.html'

const POPUP_SHOW_TIMEOUT = 100
const POPUP_CLOSE_TIMEOUT = 300

class SavePopup {
    private saveHandler: () => void = this.defaultSaveHandler

    private cancelHandler: () => void = this.defaultCancelHandler

    /**
     * @param {function} saveHandler
     * @param {function} cancelHandler
     */
    show(saveHandler: () => void, cancelHandler: () => void): void {
        this.saveHandler = saveHandler
        this.cancelHandler = cancelHandler

        document.body.insertAdjacentHTML(
            'beforeend',
            template(savePoppup, {
                baseUrl: chrome.runtime.getURL(''),
                title: template(getTranslation('savePopup_title'), { url: window.location.host }),
                btn_cancel: getTranslation('savePopup_btn_cancel'),
                btn_save: getTranslation('savePopup_btn_save'),
            }),
        )

        // Animation
        setTimeout(() => {
            const elem = document.getElementById('chromekdbxSavePopup')
            elem && elem.classList.add('chromekdbx-visible')
        }, POPUP_SHOW_TIMEOUT)

        const chromekdbxSavePopup = document.getElementById('chromekdbxSavePopup')
        chromekdbxSavePopup && chromekdbxSavePopup.addEventListener('click', this.popupClickListener.bind(this))
    }

    closeSavePopup(): void {
        const chromekdbxSavePopup = document.getElementById('chromekdbxSavePopup')

        chromekdbxSavePopup && chromekdbxSavePopup.classList.remove('chromekdbx-visible')
        setTimeout(() => {
            chromekdbxSavePopup && chromekdbxSavePopup.remove()
        }, POPUP_CLOSE_TIMEOUT)
    }

    defaultSaveHandler(): void { }

    defaultCancelHandler(): void { }

    savePassword(): void {
        this.saveHandler()
        this.closeSavePopup()
    }

    popupClickListener(e: MouseEvent): void {
        const target = e.target as HTMLButtonElement
        if (target.type === 'button') {
            switch (target.dataset.type) {
            case 'close':
                this.closeSavePopup()
                this.cancelHandler()
                break
            case 'save':
                this.savePassword()
                break
            default:
                break
            }
        }
    }
}

export default new SavePopup()
