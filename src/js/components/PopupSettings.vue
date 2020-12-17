<template>
    <div class="settings-content">
        <div v-if="ignoredListVisible" class="settings-ignoredList">
            <a href="#" @click="ignoredListVisible = false" class="settings-close"></a>
            <h4>Ignored domains:</h4>
            <ul class="settings-ignoredListContent">
                <li v-for="(item, index) in ignoredList" :key="index">
                    {{ item }}
                    <a @click.prevent="deleteItem(item)" class="popup-icon">
                        <DeleteIcon />
                    </a>
                </li>
            </ul>
        </div>
        <template v-else>
            <div class="settingsContent-row">
                <b class="settingsContent-label">Api url:</b>
                <span :title="apiUrl">{{ apiUrl }}</span>
            </div>
            <div class="settingsContent-row">
                <b class="settingsContent-label">DB name:</b>
                <span :title="dbName">{{ dbName }}</span>
            </div>

            <button @click="ignoredListVisible = true" type="button">ignored list</button>
        </template>
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component'
import TranslationMixin from './TranslationMixin'
import ApiManager from '../ApiManager'
import { MSG_GET_IGNORE_LIST, MSG_IGNORE_LIST_REMOVE_ITEM, MSG_IGNORE_LIST_SAVE } from '../constants'
import DeleteIcon from '../../../extension/static/icons/delete.svg'

const apiManager = new ApiManager()

@Component({
    name: 'PopupSettings',
    components: { DeleteIcon }
})
export default class PopupSettings extends mixins(TranslationMixin) {
    private ignoredListVisible = false

    private ignoredList: string[] = []

    get apiUrl(): string | null {
        return apiManager.getBaseUrl()
    }

    get dbName(): string | null {
        return apiManager.getDbName()
    }

    private created() {
        chrome.runtime.sendMessage({ type: MSG_GET_IGNORE_LIST }, (data: string[]) => {
            this.ignoredList = data
        })
    }

    private deleteItem(host: string): void {
        chrome.runtime.sendMessage({
            type: MSG_IGNORE_LIST_REMOVE_ITEM,
            host
        })

        this.ignoredList = this.ignoredList.filter((item: string) => item !== host)
    }
}
</script>
