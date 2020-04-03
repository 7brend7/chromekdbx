<template>
    <div>
        <ApiFormDbSelect v-if="apiFormDbSelect" @setApiFormDbSelect="setApiFormDbSelect" @setReady="setReady" />

        <div v-else class="startForm--apiForm" :class="[{'startForm--formDisabled': isLoading}]">
            <div class="startForm--apiError"><span v-if="errorMessage">{{errorMessage}}</span></div>

            <span class="startForm--singleLine startForm--apiFormName">
                <label>Name:</label>
                <input v-model="name" type="text" :disabled="isLoading" />
            </span>

            <span class="startForm--singleLine startForm--apiFormUrl">
                <label>API url:</label>
                <input v-model="url" type="text" :disabled="isLoading" :class="[{'error': error}]" />
            </span>

            <button class="startForm--apiConnectBtn" type="button" @click="connect" :disabled="isLoading">Connect</button>
        </div>
    </div>
</template>

<script lang="ts">
    import Component, { mixins } from 'vue-class-component';
    import { UAParser } from 'ua-parser-js';

    import ApiManager from '../ApiManager';
    import ApiFormDbSelect from './ApiFormDbSelect';

    import TranslationMixin from './TranslationMixin';
    import { MSG_RELOAD_DATABASE_MANAGER } from "../constants";

    const apiManager = new ApiManager();

    @Component({
        components: {
            ApiFormDbSelect
        }
    })
    export default class ApiForm extends mixins(TranslationMixin) {

        name = '';
        url = '';

        isLoading = false;
        error = false;
        errorMessage: string | null = null;
        apiFormDbSelect = false;

        created(): void {
            const apiData = sessionStorage.getItem(apiManager.getDataKey());

            if (apiData) {
                const { baseUrl } = JSON.parse(apiData);
                this.url = baseUrl;
            }

            const parser = new UAParser();
            const browser = parser.getBrowser();
            const os = parser.getOS();
            this.name = `${browser.name} (${browser.version}) - ${os.name} (${os.version})`;
        }

        async connect(): Promise<void> {
            //this.isLoading = true;
            //this.error = false;
            //this.errorMessage = null;

            sessionStorage.setItem(apiManager.getDataKey(), JSON.stringify({
                name: this.name,
                baseUrl: this.url,
            }));

            apiManager.saveCredentials(this.name, this.url);

            chrome.runtime.sendMessage({ type: MSG_RELOAD_DATABASE_MANAGER });
            //const resp = await apiManager.connect();

            /*if (resp !== 'OK') {
                apiManager.clear();
                this.error = true;
                this.errorMessage = "Cannot process url: wrong url or token";
            }
            else {
                this.apiFormDbSelect = true;
            }*/
            this.apiFormDbSelect = true;
            //this.isLoading = false;
        }

        setApiFormDbSelect(val: boolean): void {
            this.apiFormDbSelect = val;
        }

        setReady(val: boolean): void {
            this.$emit('setReady', val);
        }
    }
</script>