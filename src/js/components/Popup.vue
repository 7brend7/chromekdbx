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

        <div class="popup-DownloadIcon">
            <label @click.prevent="downloadDb"><DownloadIcon class="popup-icon-svg" /> {{ getMsg('popup_download_text') }}</label>
        </div>
    </main>
</template>

<script lang="ts">

    import Component, { mixins } from 'vue-class-component';
    import TranslationMixin from './TranslationMixin';
    import { MSG_GET_ALL_PASSWORD, MSG_DELETE_PASSWORD, MSG_DOWNLOAD } from '../constants';
    import DeleteIcon from '../../../extension/static/icons/delete.svg';
    import ConfirmIcon from '../../../extension/static/icons/confirm.svg';
    import CancelIcon from '../../../extension/static/icons/cancel.svg';
    import DownloadIcon from '../../../extension/static/icons/download.svg';
    import KeyIcon from '../../../extension/static/icons/key.svg';
    import UrlIcon from '../../../extension/static/icons/url.svg';
    import PopupItem from "../Interfaces/PopupItem";

    @Component({
        components: {
            DeleteIcon,
            ConfirmIcon,
            CancelIcon,
            DownloadIcon,
            UrlIcon,
        }
    })
    export default class Popup extends mixins(TranslationMixin) {
        passwords: PopupItem[] = [];

        forDelete: {
            [id: number]: boolean
        } = {};

        created(): void {
            chrome.runtime.sendMessage({ type: MSG_GET_ALL_PASSWORD }, (data: PopupItem[]) => {
                this.passwords = data.map((item: PopupItem) => {
                    const newItem = { ...item };
                    newItem.icon === null && (newItem.icon = KeyIcon);
                    return newItem;
                });
                // eslint-disable-next-line no-console
                console.log(this.passwords);
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
                this.passwords = data;
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
    };
</script>
