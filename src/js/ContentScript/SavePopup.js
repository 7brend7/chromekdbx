/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 27/12/18
 * Time: 15:07
 */

import {getTranslation, template} from "../utils";
import savePoppup from "../components/SavePopup.html";

class SavePopup {
    show(data, saveHandler) {
        this.saveHandler = saveHandler;

        document.body.insertAdjacentHTML('beforeend', template(savePoppup, {
            baseUrl: chrome.runtime.getURL(''),
            title: template(getTranslation('savePopup_title'), {url: window.location.host}),
            btn_cancel: getTranslation('savePopup_btn_cancel'),
            btn_save: getTranslation('savePopup_btn_save')
        }));

        // Animation
        setTimeout(() => {
            const elem = document.getElementById('chromekdbxSavePopup');
            elem && elem.classList.add('chromekdbx-visible');
        }, 100);

        document.getElementById('chromekdbxSavePopup').addEventListener('click', this.popupClickListener.bind(this));
    }

    closeSavePopup() {
        document.getElementById('chromekdbxSavePopup').classList.remove('chromekdbx-visible');
        setTimeout(() => {document.getElementById('chromekdbxSavePopup').remove();}, 300);
    }

    savePassword() {
        typeof this.saveHandler === 'function' && (this.saveHandler());
        this.closeSavePopup();
    }

    popupClickListener(e) {
        if (e.target.type === 'button') {
            switch(e.target.dataset.type) {
                case 'close':
                    this.closeSavePopup();
                    break;
                case 'save':
                    this.savePassword();
                    break;
            }
        }
    }
}

export default new SavePopup()
