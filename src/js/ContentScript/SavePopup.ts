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

export type SavePopupSettings = {
    neverAsk: boolean
}

class SavePopup {
    private saveHandler: (data: SavePopupSettings) => void = this.defaultSaveHandler

    private cancelHandler: (data: SavePopupSettings) => void = this.defaultCancelHandler

    private settings: SavePopupSettings = {
        neverAsk: false
    }

    /**
     * @param {function} saveHandler
     * @param {function} cancelHandler
     */
    show(saveHandler: (data: SavePopupSettings) => void, cancelHandler: (data: SavePopupSettings) => void): void {
        this.saveHandler = saveHandler
        this.cancelHandler = cancelHandler

        document.body.insertAdjacentHTML(
            'beforeend',
            template(savePoppup, {
                baseUrl: chrome.runtime.getURL(''),
                title: template(getTranslation('savePopup_title'), {
                    url: window.location.host
                }),
                btn_cancel: getTranslation('savePopup_btn_cancel'),
                btn_save: getTranslation('savePopup_btn_save'),
                domain: window.location.host
            })
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

        const neverAskChk = document.getElementById('neverAsk') as HTMLInputElement

        neverAskChk && (this.settings.neverAsk = neverAskChk.checked)

        chromekdbxSavePopup && chromekdbxSavePopup.classList.remove('chromekdbx-visible')
        setTimeout(() => {
            chromekdbxSavePopup && chromekdbxSavePopup.remove()
        }, POPUP_CLOSE_TIMEOUT)
    }

    defaultSaveHandler(): void {
        console.log('defaultSaveHandler')
    }

    defaultCancelHandler(): void {
        console.log('defaultCancelHandler')
    }

    popupClickListener(e: MouseEvent): void {
        const target = e.target as HTMLButtonElement
        if (target.type === 'button') {
            this.closeSavePopup()
            switch (target.dataset.type) {
                case 'close':
                    this.cancelHandler(this.settings)
                    break
                case 'save':
                    this.saveHandler(this.settings)
                    break
                default:
                    break
            }
        }
    }
}

export default new SavePopup()
