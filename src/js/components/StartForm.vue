<template>
    <main id="app">
        <div class="startForm">
            <div class="startForm--logo">
                <img src="/static/img/Logoedit.webp" alt="logo">
            </div>

            <div class="startForm--divider"/>

            <div class="startForm--form">

                <ReadyToStart v-if="isReady" @setReady="setReady"/>

                <div class="startForm--formAlign" v-else>

                    <div v-if="connectionType === null" class="startForm--api">
                        <label class="startForm--apiTitle">{{ getMsg('startForm_connection_titile') }}</label>

                        <span class="startForm--singleLine">
                                <button class="" type="button" @click="setConnectionType('api')">{{ getMsg('startForm_connection_api_lbl') }}</button>
                                {{ getMsg('startForm_connection_or') }}
                                <button class="" type="button" @click="setConnectionType('local')">{{ getMsg('startForm_connection_local_lbl') }}</button>
                            </span>
                    </div>

                    <div v-else>

                        <span class="startForm--apiCurrentType">{{ getMsg('startForm_connection_your_type') }} <b>{{connectionType}}</b> ( <a href="#" @click.prevent="setConnectionType(null)">{{ getMsg('startForm_connection_change') }}</a> )</span>

                        <div class="startForm--divider-H"/>

                        <LocalDbForm v-if="connectionType === 'local'" @setReady="setReady"/>

                        <ApiForm v-if="connectionType === 'api'" @setReady="setReady"/>

                    </div>

                </div>
            </div>
        </div>
    </main>
</template>

<script lang="ts">
    import Component, {mixins} from 'vue-class-component';
    import ReadyToStart from './ReadyToStart';
    import LocalDbForm from './LocalDbForm';
    import ApiForm from './ApiForm';

    import TranslationMixin from './TranslationMixin';
    import { MSG_RELOAD_DATABASE_MANAGER } from '../constants';

    @Component({
        components: {
            ReadyToStart,
            LocalDbForm,
            ApiForm,
        }
    })
    export default class StartForm extends mixins(TranslationMixin) {

        isReady = false;

        connectionType: null | 'local' | 'api' = null;

        created(): void {
            this.isReady = localStorage.getItem('startFormPassed') === '1' || false;
            this.connectionType = <'local' | 'api'>localStorage.getItem('connectionType') || null;
        }

        setConnectionType(data: 'local' | 'api' | null): void {
            data === null ? localStorage.removeItem('connectionType') : localStorage.setItem('connectionType', data);
            this.connectionType = data;

            chrome.runtime.sendMessage({ type: MSG_RELOAD_DATABASE_MANAGER });
        }

        setReady(data: boolean): void {
            this.isReady = data;
        }
    };
</script>
