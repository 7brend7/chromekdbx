<template>
    <div class="startForm--apiFormDb" :class="[{'startForm--formDisabled': isLoading}]">

        <div class="startForm--apiError"><span v-if="errorMessage">{{errorMessage}}</span></div>

        <span class="startForm--singleLine startForm--apiFormDbName">
            <label>Database name:</label>
            <input v-model="name" type="text" :disabled="isLoading" :class="[{'error': error}]"/>
        </span>

        <span class="startForm--singleLine startForm--apiFormDbPassword">
            <label>Database password:</label>
            <input v-model="password" type="password" :disabled="isLoading" :class="[{'error': error}]"/>
        </span>

        <button class="startForm--apiBackBtn" type="button" @click="back" :disabled="isLoading">back</button>
        <button class="startForm--apiNextBtn" type="button" @click="submit" :disabled="isLoading">Next</button>
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component'
import ApiDatabaseManager from '../ApiDatabaseManager'

import TranslationMixin from './TranslationMixin'
import { MSG_RELOAD_DATABASE_MANAGER } from '../constants'

@Component
export default class ApiForm extends mixins(TranslationMixin) {
        errorMessage: string | null = null;

        name = '';

        password = '';

        isLoading = false;

        error = false;

        back(): void {
            this.$emit('setApiFormDbSelect', false)
        }

        async submit(): Promise<void> {
            this.error = false
            this.errorMessage = null
            this.isLoading = true

            if (this.name === '' || this.password === '') {
                this.error = true
                this.errorMessage = 'Please provide DB name and password'
            } else {
                try {
                    const apiDatabaseManager = new ApiDatabaseManager()
                    await apiDatabaseManager.connect(this.name, this.password)
                    await apiDatabaseManager.reloadLocal()
                    chrome.runtime.sendMessage({ type: MSG_RELOAD_DATABASE_MANAGER })
                    localStorage.setItem('startFormPassed', '1')
                    this.$emit('setReady', true)
                } catch (e) {
                    this.error = true
                    this.errorMessage = e.message
                }
            }
            this.isLoading = false
        }
}
</script>
