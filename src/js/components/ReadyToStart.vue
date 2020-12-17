<template>
    <div>
        <label class="startForm--readyToStartLbl">{{ getMsg('startForm_ready_to_start') }}</label>
        <p class="startForm--readyToStartMessage">{{ getMsg('startForm_ready_to_message') }}</p>
        <p @click.prevent="readyToStartHandler" v-html="getMsg('startForm_ready_to_download')" />

        <button class="startForm--closeBtn" type="button" @click="close">
            {{ getMsg('startForm_close') }}
        </button>
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component'
import TranslationMixin from './TranslationMixin'
import DatabaseManager from '../DatabaseManager'
import PasswordManager from '../PasswordManager'
import { MSG_RELOAD_DATABASE_MANAGER } from '../constants'

const databaseManager = DatabaseManager.init()

@Component
export default class ReadyToStart extends mixins(TranslationMixin) {
    downloadDb(): void {
        databaseManager.reset()
        databaseManager.getBinary().then((data: ArrayBuffer) => {
            const blob = new Blob([data], { type: 'application/octet-stream' })
            const link = document.createElement('a') as HTMLAnchorElement
            link.href = window.URL.createObjectURL(blob)
            link.download = 'chromeKdbxDb.kdbx'
            link.click()
        })
    }

    async created() {
        chrome.runtime.sendMessage({ type: MSG_RELOAD_DATABASE_MANAGER })
    }

    clearAll(): void {
        PasswordManager.clear()
        databaseManager.clear()
        localStorage.removeItem('startFormPassed')
        this.$emit('setReady', false)
    }

    readyToStartHandler(e: MouseEvent): void {
        const target = e.target as HTMLElement
        if (target && target.tagName.toLowerCase() === 'a') {
            switch (target.dataset.type) {
                case 'download':
                    this.downloadDb()
                    break
                case 'clear':
                    this.clearAll()
                    break
                default:
                    break
            }
        }
    }

    close(): void {
        window.close()
    }
}
</script>
