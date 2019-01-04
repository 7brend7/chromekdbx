<template>
    <main id="app" class="popup">
        <div class="popup-logo">
            <img src="/static/icons/keepass_32x32.png" alt="logo"/>

            <label v-html="getMsg('popup_logo_text')"></label>
        </div>
        <ul class="popup-password">
            <li class="popup-emptyMsg" v-if="passwords.length === 0">{{getMsg('popup_empty_list')}}</li>
            <li v-for="item in passwords">
                <img :src="item.icon" alt="favicon" class="popup-favicon" />
                <a class="popup-UrlLink" :href="item.url" @click.prevent="openPage(item.url)">{{ parseUrl(item.url) }}</a>

                <div class="popup-confirmIcons" v-if="forDelete[item.id]">
                    <div class="popup-ConfirmIcon" @click.prevent="confirmDeleteItem(item.id)"><ConfirmIcon class="popup-icon" /></div>

                    <div class="popup-CancelIcon" @click.prevent="cancelDeleteItem(item.id)"><CancelIcon class="popup-icon" /></div>
                </div>
                <div v-else class="popup-deleteIcon" @click.prevent="deleteItem(item.id)"><DeleteIcon class="popup-icon" /></div>
            </li>
        </ul>
        <div class="popup-DownloadIcon">
            <label @click.prevent="downloadDb"><DownloadIcon class="popup-icon" /> {{getMsg('popup_download_text')}}</label>
        </div>
    </main>
</template>

<script>

    import TranslationMixin from './TranslationMixin';
    import { MSG_GET_ALL_PASSWORD, MSG_DELETE_PASSWORD, MSG_DOWNLOAD } from '../constants';
    import DeleteIcon from '../../../extension/static/icons/delete.svg';
    import ConfirmIcon from '../../../extension/static/icons/confirm.svg';
    import CancelIcon from '../../../extension/static/icons/cancel.svg';
    import DownloadIcon from '../../../extension/static/icons/download.svg';

    export default {
        mixins: [TranslationMixin],
        components: {
            DeleteIcon,
            ConfirmIcon,
            CancelIcon,
            DownloadIcon,
        },
        data: function () {
            return {
                passwords: [],
                forDelete: {}
            }
        },
        created: function () {
            chrome.runtime.sendMessage({type: MSG_GET_ALL_PASSWORD}, (data) => {
                this.passwords = data;
            });
        },
        methods: {
            parseUrl(url) {
                const parsed = new URL(url);
                return parsed.host;
            },
            openPage(host) {
                chrome.tabs.create({active: true, url: host});
            },
            deleteItem(id) {
                this.forDelete = {
                    ...this.forDelete,
                    [id]: true
                }
            },
            confirmDeleteItem(id) {
                chrome.runtime.sendMessage({type: MSG_DELETE_PASSWORD, id}, (data) => {
                    this.passwords = data;
                });
            },
            cancelDeleteItem(id) {
                delete this.forDelete[id];
                this.forDelete = {...this.forDelete};
            },
            downloadDb() {
                chrome.runtime.sendMessage({type: MSG_DOWNLOAD, blobType: "application/octet-stream"}, (data) => {
                    const link = document.createElement('a');
                    link.href = data;
                    link.download = 'chromeKdbxDb.kdbx';
                    link.click();
                });
            }
        }
    }
</script>
