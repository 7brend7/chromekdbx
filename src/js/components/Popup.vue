<template>
    <main id="app" class="popup">
        <div class="popup-logo">
            <img alt="logo" src="/static/icons/keepass_32x32.png" />

            <label v-html="getMsg('popup_logo_text')" />

            <a @click.prevent="onSettingsClick" class="popup-icon settings-icon">
                <SettingsActiveIcon v-if="isSettingMode" />
                <SettingsIcon v-else />
            </a>
        </div>
        <popup-settings v-if="isSettingMode" />
        <popup-edit-item v-else-if="editItem" :data="editItem" @onClose="editItem = null" />
        <template v-else>
            <transition-group name="popup-password" class="popup-password" tag="ul">
                <li :key="0" class="popup-emptyMsg" v-if="passwords.length === 0">
                    {{ getMsg('popup_empty_list') }}
                </li>
                <li
                    :class="[
                        {
                            'popup-passwordItem_transitionOn': forDelete[item.id]
                        }
                    ]"
                    :key="item.id"
                    v-for="item in passwords"
                >
                    <img :src="item.icon" class="popup-favicon" v-if="typeof item.icon === 'string'" />
                    <div :is="item.icon" class="popup-favicon popup-defaultIcon" v-else />

                    <div class="popup-UrlLink">
                        <a target="_blank" :href="item.url">{{ parseUrl(item.url) }}</a>
                    </div>
                    <a @click.prevent="toggleEdit(item)" class="popup-icon">
                        <EditIcon />
                    </a>
                    <template v-if="forDelete[item.id]">
                        <a @click.prevent="confirmDeleteItem(item.id)" class="popup-icon">
                            <ConfirmIcon />
                        </a>
                        <a @click.prevent="cancelDeleteItem(item.id)" class="popup-icon">
                            <CancelIcon />
                        </a>
                    </template>
                    <a @click.prevent="deleteItem(item.id)" class="popup-icon" v-else>
                        <DeleteIcon />
                    </a>
                </li>
            </transition-group>

            <div class="popup-BottomIcons">
                <label @click.prevent="downloadDb" :title="getMsg('popup_download_text')">
                    <ExportIcon class="popup-icon-svg" />
                </label>
                <input @change="importFileChanged" ref="file" style="display: none" type="file" />
                <label @click.prevent="importDb" :title="getMsg('popup_import_db_text')">
                    <ImportIcon class="popup-icon-svg" />
                </label>
                <label
                    class="popup-BottomIcons--labelLast"
                    :title="getMsg('popup_synchronization_text')"
                    @click.prevent="getDb"
                    v-if="connectionType === 'api'"
                >
                    <SynchronizationIcon
                        :class="{
                            'popup-icon-svg--loading': loadingIcons.synchronization
                        }"
                        class="popup-icon-svg"
                    />
                </label>
            </div>
        </template>
    </main>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component'
import { ByteUtils } from 'kdbxweb'
import TranslationMixin from './TranslationMixin'
import { MSG_DELETE_PASSWORD, MSG_DOWNLOAD, MSG_GET_FRESH_DB, MSG_IMPORT, MSG_IMPORT_WITH_PASSW } from '../constants'
import DeleteIcon from '../../../extension/static/icons/delete.svg'
import ConfirmIcon from '../../../extension/static/icons/confirm.svg'
import CancelIcon from '../../../extension/static/icons/cancel.svg'
import ImportIcon from '../../../extension/static/icons/import.svg'
import ExportIcon from '../../../extension/static/icons/export.svg'
import SynchronizationIcon from '../../../extension/static/icons/synchronization.svg'
import KeyIcon from '../../../extension/static/icons/key.svg'
import SettingsIcon from '../../../extension/static/icons/settings.svg'
import SettingsActiveIcon from '../../../extension/static/icons/settings-active.svg'
import EditIcon from '../../../extension/static/icons/edit.svg'
import PopupItem from '../Interfaces/PopupItem'
import { getTranslation, template } from '../utils'
import confirmTmpl from './Confirm.html'
import promtPasswordTmp from './PromtPassword.html'
import PopupSettings from './PopupSettings.vue'
import PopupEditItem from './PopupEditItem.vue'

const POPUP_PASSWORDS_LIST_STORAGE_KEY = 'popup_passwords_list'

@Component({
    components: {
        PopupEditItem,
        DeleteIcon,
        ConfirmIcon,
        CancelIcon,
        ImportIcon,
        ExportIcon,
        SynchronizationIcon,
        SettingsIcon,
        SettingsActiveIcon,
        PopupSettings,
        EditIcon
    }
})
export default class Popup extends mixins(TranslationMixin) {
    passwords: PopupItem[] = this.getPasswordsList()

    forDelete: {
        [id: number]: boolean
    } = {}

    loadingIcons: { [kaey: string]: boolean } = {
        synchronization: false
    }

    connectionType: 'local' | 'api' = 'local'

    isSettingMode = false

    editItem: PopupItem | null = null

    getPasswordsList(): PopupItem[] {
        const data: string | null = localStorage.getItem(POPUP_PASSWORDS_LIST_STORAGE_KEY)

        if (data) {
            try {
                const result: PopupItem[] = JSON.parse(data)

                return result
            } catch (e) {
                console.error(e.message)
            }
        }

        return []
    }

    preparePopupItems(data: PopupItem[]): void {
        localStorage.setItem(POPUP_PASSWORDS_LIST_STORAGE_KEY, JSON.stringify(data))

        this.passwords = data.map((item: PopupItem) => {
            const newItem = { ...item }
            if (newItem.icon) {
                const data: Uint8Array = ByteUtils.base64ToBytes(newItem.icon)
                newItem.icon = window.URL.createObjectURL(new Blob([data.buffer], { type: 'image/x-icon' }))
            } else {
                newItem.icon = KeyIcon
            }
            return newItem
        })
    }

    created(): void {
        this.connectionType = (localStorage.getItem('connectionType') as 'local' | 'api') || 'local'
        this.getDb()
    }

    getDb(): void {
        this.loadingIcons.synchronization = true

        chrome.runtime.sendMessage({ type: MSG_GET_FRESH_DB }, (data: PopupItem[] | null) => {
            data && this.preparePopupItems(data)
            this.loadingIcons.synchronization = false
        })
    }

    parseUrl(url: string): string {
        const parsed = new URL(url)
        return parsed.host
    }

    toggleEdit(item: PopupItem): void {
        this.editItem = item
    }

    deleteItem(id: number): void {
        this.forDelete = {
            ...this.forDelete,
            [id]: true
        }
    }

    confirmDeleteItem(id: number): void {
        chrome.runtime.sendMessage({ type: MSG_DELETE_PASSWORD, id }, (data: PopupItem[]) => {
            this.preparePopupItems(data)
        })
    }

    cancelDeleteItem(id: number): void {
        delete this.forDelete[id]
        this.forDelete = { ...this.forDelete }
    }

    downloadDb(): void {
        chrome.runtime.sendMessage({ type: MSG_DOWNLOAD, blobType: 'application/octet-stream' }, (data: string) => {
            const link = document.createElement('a') as HTMLAnchorElement
            link.href = data
            link.download = 'chromeKdbxDb.kdbx'
            link.click()
        })
    }

    importDb(): void {
        document.body.insertAdjacentHTML(
            'beforeend',
            template(confirmTmpl, {
                title: 'Are you sure? This will replace your current DB!',
                btn_no: getTranslation('confirm_btn_no'),
                btn_yes: getTranslation('confirm_btn_yes')
            })
        )

        const chromekdbxConfirm = document.getElementById('chromekdbxConfirm')
        chromekdbxConfirm && chromekdbxConfirm.addEventListener('click', this.confirmClickListener.bind(this))
    }

    closeForm(): void {
        const chromekdbxConfirmStyle = document.getElementById('chromekdbxConfirmStyle')
        chromekdbxConfirmStyle && chromekdbxConfirmStyle.remove()
        const chromekdbxConfirm = document.getElementById('chromekdbxConfirm')
        chromekdbxConfirm && chromekdbxConfirm.remove()
        ;[...document.getElementsByClassName('chromekdbx-overlay')].forEach(item => item.remove())
    }

    confirmClickListener(e: MouseEvent): void {
        const target = e.target as HTMLButtonElement
        if (target.type === 'button') {
            switch (target.dataset.type) {
                case 'ok':
                    ;(this.$refs.file as HTMLElement).click()
                    this.closeForm()
                    break
                case 'close':
                    this.closeForm()
                    break
                default:
                    break
            }
        }
    }

    importFileChanged(e: Event): void {
        const target = e.target as HTMLInputElement
        if (target.files && target.files[0]) {
            const reader = new FileReader()
            reader.onload = (pe: ProgressEvent) => {
                target.value = ''

                chrome.runtime.sendMessage(
                    {
                        type: MSG_IMPORT,
                        data: new Int8Array((pe.target as FileReader).result as ArrayBuffer)
                    },
                    (success: boolean) => {
                        if (!success) {
                            document.body.insertAdjacentHTML(
                                'beforeend',
                                template(promtPasswordTmp, {
                                    title: 'Wrong password. Try another one?',
                                    btn_cancel: getTranslation('promt_btn_cancel'),
                                    btn_ok: getTranslation('promt_btn_ok')
                                })
                            )

                            const chromekdbxPromtPassword = document.getElementById('chromekdbxPromtPassword')
                            const chromekdbxPromtPasswordField = document.getElementById('chromekdbxPromtPasswordField')
                            chromekdbxPromtPasswordField && chromekdbxPromtPasswordField.focus()

                            chromekdbxPromtPasswordField &&
                                chromekdbxPromtPasswordField.addEventListener('keypress', (e: KeyboardEvent) => {
                                    const key = e.which || e.keyCode
                                    if (key === 13) {
                                        // 13 is enter
                                        const btn: HTMLInputElement | null = document.querySelector('button[data-type="ok"]')
                                        btn && btn.click()
                                    }
                                })

                            chromekdbxPromtPassword &&
                                chromekdbxPromtPassword.addEventListener('click', (e: MouseEvent) => {
                                    this.promtPasswordClickListener(e, new Int8Array((pe.target as FileReader).result as ArrayBuffer))
                                })
                        } else {
                            this.getDb()
                        }
                    }
                )
            }

            reader.readAsArrayBuffer(target.files[0])
        }
    }

    closePasswordPromt(): void {
        const chromekdbxPromtPasswordStyle = document.getElementById('chromekdbxPromtPasswordStyle')
        chromekdbxPromtPasswordStyle && chromekdbxPromtPasswordStyle.remove()
        const chromekdbxPromtPassword = document.getElementById('chromekdbxPromtPassword')
        chromekdbxPromtPassword && chromekdbxPromtPassword.remove()
        ;[...document.getElementsByClassName('chromekdbx-overlay')].forEach(item => item.remove())
    }

    promtPasswordClickListener(e: MouseEvent, data: { [key: number]: number }): void {
        const target = e.target as HTMLButtonElement
        if (target.type === 'button') {
            switch (target.dataset.type) {
                case 'ok': {
                    const chromekdbxPromtPasswordField = document.getElementById('chromekdbxPromtPasswordField')
                    if (chromekdbxPromtPasswordField) {
                        const passwd = (chromekdbxPromtPasswordField as HTMLInputElement).value
                        passwd &&
                            chrome.runtime.sendMessage({ type: MSG_IMPORT_WITH_PASSW, passwd, data }, (success: boolean) => {
                                success && this.getDb()
                            })
                    }
                    this.closePasswordPromt()
                    break
                }
                case 'close':
                    this.closePasswordPromt()
                    break
                default:
                    break
            }
        }
    }

    onSettingsClick() {
        this.isSettingMode = !this.isSettingMode
    }
}
</script>
