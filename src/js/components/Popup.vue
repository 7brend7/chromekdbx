import PopupItem from "../Interfaces/PopupItem";

<template>
    <main id="app" class="popup">
        <div class="popup-logo">
            <img src="/static/icons/keepass_32x32.png" alt="logo">

            <label v-html="getMsg('popup_logo_text')" />
        </div>
        <transition-group name="popup-password" class="popup-password" tag="ul">
            <li v-if="passwords.length === 0" :key="0" class="popup-emptyMsg">{{ getMsg('popup_empty_list') }}</li>
            <li v-for="item in passwords" :key="item.id" :class="[{'popup-passwordItem_transitionOn': forDelete[item.id]}]">
                <img v-if="typeof item.icon === 'string'" :src="item.icon" alt="favicon" class="popup-favicon">
                <div :is="item.icon" v-else class="popup-favicon popup-defaultIcon" />
                <span class="popup-UrlLink">{{ parseUrl(item.url) }}</span>
                <a class="popup-icon" @click.prevent="openPage(item.url)"><UrlIcon /></a>
                <template v-if="forDelete[item.id]">
                    <a class="popup-icon" @click.prevent="confirmDeleteItem(item.id)"><ConfirmIcon /></a>
                    <a class="popup-icon" @click.prevent="cancelDeleteItem(item.id)"><CancelIcon /></a>
                </template>
                <a v-else class="popup-icon" @click.prevent="deleteItem(item.id)"><DeleteIcon /></a>
            </li>
        </transition-group>

        <div class="popup-BottomIcons">
            <label @click.prevent="downloadDb" :title="getMsg('popup_download_text')">
                <ExportIcon class="popup-icon-svg" />
            </label>
            <input type="file" ref="file" style="display: none" @change="importFileChanged">
            <label @click.prevent="importDb" :title="getMsg('popup_import_db_text')">
                <ImportIcon class="popup-icon-svg" />
            </label>
            <label v-if="connectionType === 'api'" @click.prevent="synchronizeDb" :title="getMsg('popup_synchronization_text')">
                <SynchronizationIcon class="popup-icon-svg" :class="{ 'popup-icon-svg--loading' : loadingIcons.synchronization }" />
            </label>
        </div>
    </main>
</template>

<script lang="ts">

    import Component, { mixins } from 'vue-class-component';
    import TranslationMixin from './TranslationMixin';
    import { MSG_GET_ALL_PASSWORD, MSG_DELETE_PASSWORD, MSG_DOWNLOAD, MSG_SYNCHRONIZE, MSG_IMPORT, MSG_IMPORT_WITH_PASSW } from '../constants';
    import DeleteIcon from '../../../extension/static/icons/delete.svg';
    import ConfirmIcon from '../../../extension/static/icons/confirm.svg';
    import CancelIcon from '../../../extension/static/icons/cancel.svg';
    import ImportIcon from '../../../extension/static/icons/import.svg';
    import ExportIcon from '../../../extension/static/icons/export.svg';
    import SynchronizationIcon from '../../../extension/static/icons/synchronization.svg';
    import KeyIcon from '../../../extension/static/icons/key.svg';
    import UrlIcon from '../../../extension/static/icons/url.svg';
    import PopupItem from "../Interfaces/PopupItem";
    import { ByteUtils } from 'kdbxweb';
    import { getTranslation, template } from "../utils";
    import confirmTmpl from '../components/Confirm.html';
    import promtPasswordTmp from '../components/PromtPassword.html';

    @Component({
        components: {
            DeleteIcon,
            ConfirmIcon,
            CancelIcon,
            ImportIcon,
            ExportIcon,
            SynchronizationIcon,
            UrlIcon,
        }
    })
    export default class Popup extends mixins(TranslationMixin) {
        passwords: PopupItem[] = [];

        forDelete: {
            [id: number]: boolean
        } = {};

        loadingIcons: {[kaey: string]: boolean} = {
            synchronization: false
        };

        connectionType: 'local' | 'api' = 'local';

        preparePopupItems(data: PopupItem[]) {
            this.passwords = data.map((item: PopupItem) => {
                const newItem = { ...item };
                if (newItem.icon) {
                    const data: Uint8Array = ByteUtils.base64ToBytes(newItem.icon);
                    newItem.icon = window.URL.createObjectURL(new Blob([data.buffer], { type: 'image/x-icon' }));
                }
                else {
                    newItem.icon = KeyIcon;
                }
                return newItem;
            });
        }

        created(): void {
            this.reloadItems();

            this.connectionType = <'local' | 'api'>localStorage.getItem('connectionType') || 'local';
        }

        reloadItems(): void {
            chrome.runtime.sendMessage({ type: MSG_GET_ALL_PASSWORD }, (data: PopupItem[]) => {
                this.preparePopupItems(data);
            });
        }

        parseUrl(url: string): string {
            const parsed = new URL(url);
            return parsed.host;
        }

        openPage(host: string): void {
            chrome.tabs.create({ active: true, url: host });
        }

        deleteItem(id: number): void {
            this.forDelete = {
                ...this.forDelete,
                [id]: true,
            };
        }

        confirmDeleteItem(id: number): void {
            chrome.runtime.sendMessage({ type: MSG_DELETE_PASSWORD, id }, (data: PopupItem[]) => {
                this.preparePopupItems(data);
            });
        }

        cancelDeleteItem(id: number): void {
            delete this.forDelete[id];
            this.forDelete = { ...this.forDelete };
        }

        downloadDb(): void {
            chrome.runtime.sendMessage({ type: MSG_DOWNLOAD, blobType: 'application/octet-stream' }, (data: string) => {
                const link = <HTMLAnchorElement>document.createElement('a');
                link.href = data;
                link.download = 'chromeKdbxDb.kdbx';
                link.click();
            });
        }

        importDb(): void {
            document.body.insertAdjacentHTML('beforeend', template(confirmTmpl, {
                title: 'Are you sure? This will replace your current DB!',
                btn_no: getTranslation('confirm_btn_no'),
                btn_yes: getTranslation('confirm_btn_yes'),
            }));

            const chromekdbxConfirm = document.getElementById('chromekdbxConfirm');
            chromekdbxConfirm && chromekdbxConfirm.addEventListener('click', this.confirmClickListener.bind(this));
        }

        confirmClickListener(e: MouseEvent): void {
            const target = e.target as HTMLButtonElement;
            if (target.type === 'button') {
                switch (target.dataset.type) {
                    case 'ok':
                        (this.$refs.file as HTMLElement).click();
                    case 'close':
                        const chromekdbxConfirmStyle = document.getElementById('chromekdbxConfirmStyle');
                        chromekdbxConfirmStyle && chromekdbxConfirmStyle.remove();
                        const chromekdbxConfirm = document.getElementById('chromekdbxConfirm');
                        chromekdbxConfirm && chromekdbxConfirm.remove();
                        [...document.getElementsByClassName('chromekdbx-overlay')].forEach(item => item.remove());
                        break;
                    default: break;
                }
            }
        }

        importFileChanged(e: Event): void {
            const target = e.target as HTMLInputElement;
            if (target.files && target.files[0]) {
                const reader = new FileReader();
                reader.onload = (pe: ProgressEvent) => {
                    target.value = '';

                    chrome.runtime.sendMessage({ type: MSG_IMPORT, data: new Int8Array((pe.target as FileReader).result as ArrayBuffer) }, (success: boolean) => {
                        if (!success) {

                            document.body.insertAdjacentHTML('beforeend', template(promtPasswordTmp, {
                                title: 'Wrong password. Try another one?',
                                btn_cancel: getTranslation('promt_btn_cancel'),
                                btn_ok: getTranslation('promt_btn_ok'),
                            }));

                            const chromekdbxPromtPassword = document.getElementById('chromekdbxPromtPassword');
                            const chromekdbxPromtPasswordField = document.getElementById('chromekdbxPromtPasswordField');
                            chromekdbxPromtPasswordField && chromekdbxPromtPasswordField.focus();

                            chromekdbxPromtPasswordField && chromekdbxPromtPasswordField.addEventListener('keypress', (e: KeyboardEvent) => {
                                const key = e.which || e.keyCode;
                                if (key === 13) { // 13 is enter
                                    const btn: HTMLInputElement | null = document.querySelector('button[data-type="ok"]');
                                    btn && btn.click();
                                }
                            });

                            chromekdbxPromtPassword && chromekdbxPromtPassword.addEventListener('click', (e: MouseEvent) => {
                                this.promtPasswordClickListener(e, new Int8Array((pe.target as FileReader).result as ArrayBuffer));
                            });
                        }
                        else {
                            this.reloadItems();
                        }
                    });
                };

                reader.readAsArrayBuffer(target.files[0]);
            }
        }

        promtPasswordClickListener(e: MouseEvent, data: {[key: number]: number}): void {
            const target = e.target as HTMLButtonElement;
            if (target.type === 'button') {
                switch (target.dataset.type) {
                    case 'ok':
                        const chromekdbxPromtPasswordField = document.getElementById('chromekdbxPromtPasswordField');
                        if (chromekdbxPromtPasswordField) {
                            const passwd = (chromekdbxPromtPasswordField as HTMLInputElement).value;
                            passwd && chrome.runtime.sendMessage({type: MSG_IMPORT_WITH_PASSW, passwd, data}, (success: boolean) => {
                                success && this.reloadItems();
                            });
                        }
                    case 'close':
                        const chromekdbxPromtPasswordStyle = document.getElementById('chromekdbxPromtPasswordStyle');
                        chromekdbxPromtPasswordStyle && chromekdbxPromtPasswordStyle.remove();
                        const chromekdbxPromtPassword = document.getElementById('chromekdbxPromtPassword');
                        chromekdbxPromtPassword && chromekdbxPromtPassword.remove();
                        [...document.getElementsByClassName('chromekdbx-overlay')].forEach(item => item.remove());
                        break;
                    default: break;
                }
            }
        }

        synchronizeDb(target: any): void {
            this.loadingIcons.synchronization = true;

            chrome.runtime.sendMessage({ type: MSG_SYNCHRONIZE }, () => {
                this.reloadItems();
                this.loadingIcons.synchronization = false;
            });
        }
    };
</script>
