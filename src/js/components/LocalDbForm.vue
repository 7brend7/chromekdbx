<template>
    <div>
        <span v-if="!isNewDb">
            <label>{{ getMsg('startForm_choose_db') }}</label>

            <label class="startForm--formFileContainer">
                <input
                    v-model="fileName"
                    type="text"
                    :placeholder="getMsg('startForm_file_placeholder')"
                    :class="[{ error: checkError('db') }]"
                />
                <input type="file" @change="processFile($event)" />
            </label>

            <label class="startForm--formFileContainerNote">
                {{ getMsg('startForm_dont_have_such') }}
                <a href="#" @click.prevent="switchDb(true)">{{ getMsg('startForm_click_here') }}</a
                >.
            </label>
        </span>

        <span v-else>
            <span v-html="getMsg('startForm_create_db_intro')" />
            <label class="startForm--formFileContainerNote">
                {{ getMsg('startForm_still_open_db') }}
                <a href="#" @click.prevent="switchDb(false)">{{ getMsg('startForm_click_here') }}</a
                >.
            </label>
        </span>

        <div class="startForm--divider-H" />

        <label>{{ getMsg('startForm_password') }}</label>
        <input v-model="password" type="password" :class="[{ error: checkError('password') }]" />

        <label v-if="isNewDb">{{ getMsg('startForm_repeat_password') }}</label>
        <input v-if="isNewDb" v-model="rePassword" type="password" :class="[{ error: checkError('rePassword') }]" />

        <button class="startForm--formFileContainerContinueBtn" type="button" @click="submit">
            {{ getMsg('startForm_continue') }}
        </button>
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component'
import kdbxweb, { Credentials, ProtectedValue } from 'kdbxweb'
import DatabaseManager from '../DatabaseManager'
import PasswordManager from '../PasswordManager'

import TranslationMixin from './TranslationMixin'
import LocalDatabaseManager from '../LocalDatabaseManager'

let databaseManager = DatabaseManager.init()

@Component
export default class LocalDbForm extends mixins(TranslationMixin) {
    isNewDb = false

    fileName = ''

    password = ''

    rePassword = ''

    errors: {
        [key: string]: boolean
    } = {}

    constructor() {
        super()

        databaseManager = DatabaseManager.init()
    }

    switchDb(isNewDb: boolean): void {
        this.errors = {}
        this.isNewDb = isNewDb
    }

    db: File | null = null

    checkError(name: string): boolean {
        return typeof this.errors[name] !== 'undefined'
    }

    processDbManager(credentials: Credentials): Promise<void> {
        return new Promise((res, rej) => {
            if (this.isNewDb) {
                ;(databaseManager as LocalDatabaseManager)
                    .initNew(credentials, 'chromekdbx')
                    .then(res)
                    .catch(rej)
            } else {
                const reader = new FileReader()
                reader.onload = async function loadFunc() {
                    if (this.result && this.result instanceof ArrayBuffer) {
                        ;(databaseManager as LocalDatabaseManager).initExisted(this.result, credentials).then(() => {
                            ;(databaseManager as LocalDatabaseManager).saveDb().then(res)
                        })
                    }
                }

                this.db && reader.readAsArrayBuffer(this.db)
            }
        })
    }

    processFile(e: Event): void {
        const target = e.target as HTMLInputElement
        if (target && target.files) {
            this.db = target.files[0]
            this.fileName = this.db.name
        }
    }

    validate(): boolean {
        this.errors = {}
        const validationFields = this.isNewDb ? ['password', 'rePassword'] : ['db', 'password']

        validationFields.forEach((value: string) => {
            if (!(this as any)[value]) {
                this.errors[value] = true
            }
        })

        this.isNewDb && this.password !== this.rePassword && (this.errors.rePassword = true)

        return Object.keys(this.errors).length === 0
    }

    submit(): void {
        if (!this.validate()) {
            return
        }

        PasswordManager.set(this.password).then((passwd: ProtectedValue) => {
            const credentials = new kdbxweb.Credentials(passwd, '')

            this.processDbManager(credentials)
                .then(() => {
                    localStorage.setItem('startFormPassed', '1')
                    this.$emit('setReady', true)
                })
                .catch(() => {
                    this.password = ''
                    this.errors.password = true
                })
        })
    }
}
</script>
