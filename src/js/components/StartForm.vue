<template>
    <main id="app">
        <div class="startForm">
            <div class="startForm--logo">
                <img src="/static/img/Logoedit.webp" alt="logo">
            </div>
            <div class="startForm--divider" />
            <div class="startForm--form">
                <div class="startForm--formAlign">
                    <span v-if="isReady">
                        <label class="startForm--readyToStartLbl">{{ getMsg('startForm_ready_to_start') }}</label>
                        <p class="startForm--readyToStartMessage">{{ getMsg('startForm_ready_to_message') }}</p>
                        <p @click.prevent="readyToStartHandler" v-html="getMsg('startForm_ready_to_download')" />

                        <button class="startForm--closeBtn" type="button" @click="close">
                            {{ getMsg('startForm_close') }}
                        </button>
                    </span>
                    <span v-else>
                        <span v-if="!isNewDb">
                            <label>{{ getMsg('startForm_choose_db') }}</label>

                            <label class="startForm--formFileContainer">
                                <input v-model="fileName" type="text" :placeholder="getMsg('startForm_file_placeholder')" :class="[{'error': checkError('db')}]">
                                <input type="file" @change="processFile($event)">
                            </label>

                            <label class="startForm--formFileContainerNote">
                                {{ getMsg('startForm_dont_have_such') }} <a href="#" @click.prevent="switchDb(true)">{{ getMsg('startForm_click_here') }}</a>.
                            </label>
                        </span>

                        <span v-else>
                            <span v-html="getMsg('startForm_create_db_intro')" />
                            <label class="startForm--formFileContainerNote">
                                {{ getMsg('startForm_still_open_db') }} <a href="#" @click.prevent="switchDb(false)">{{ getMsg('startForm_click_here') }}</a>.
                            </label>
                        </span>

                        <div class="startForm--divider-H" />

                        <label>{{ getMsg('startForm_password') }}</label>
                        <input v-model="password" type="password" :class="[{'error': checkError('password')}]">

                        <label v-if="isNewDb">{{ getMsg('startForm_repeat_password') }}</label>
                        <input v-if="isNewDb" v-model="re_password" type="password" :class="[{'error': checkError('re_password')}]">

                        <button class="startForm--formFileContainerContinueBtn" type="button" @click="submit">{{ getMsg('startForm_continue') }}</button>
                    </span>
                </div>
            </div>
        </div>
    </main>
</template>

<script lang="ts">
    import Component, { mixins } from 'vue-class-component';
    import kdbxweb, {Credentials, ProtectedValue} from 'kdbxweb';
    import databaseManager from '../DatabaseManager';
    import PasswordManager from '../PasswordManager';

    import TranslationMixin from './TranslationMixin';

    @Component
    export default class StartForm extends mixins(TranslationMixin) {

        fileName = '';
        password = '';
        re_password = '';

        isNewDb = false;
        isReady = false;

        db: File | null = null;
        errors: {
            [key: string]: boolean
        } = {};

        created(): void {
            this.isReady = localStorage.getItem('startFormPassed') === '1' || false;
        }

        checkError(name: string): boolean {
            return typeof this.errors[name] !== 'undefined';
        }

        switchDb(isNewDb: boolean): void {
            this.errors = {};
            this.isNewDb = isNewDb;
        }

        validate(): boolean {
            this.errors = {};
            const validationFields = this.isNewDb ? ['password', 're_password'] : ['db', 'password'];

            validationFields.forEach((value: string) => {
                if (!(this as any)[value]) {
                    this.errors[value] = true;
                }
            });

            this.isNewDb && this.password !== this.re_password && (this.errors.re_password = true);

            return Object.keys(this.errors).length === 0;
        }

        readyToStartHandler(e: MouseEvent): void {
            const target = e.target as HTMLElement;
            if (target && target.tagName.toLowerCase() === 'a') {
                switch (target.dataset.type) {
                    case 'download': this.downloadDb(); break;
                    case 'clear': this.clearAll(); break;
                    default: break;
                }
            }
        }

        downloadDb(): void {
            databaseManager.reset();
            databaseManager.getBinary().then((data: ArrayBuffer) => {
                const blob = new Blob([data], { type: 'application/octet-stream' });
                const link = <HTMLAnchorElement>document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = 'chromeKdbxDb.kdbx';
                link.click();
            });
        }

        clearAll(): void {
            PasswordManager.clear();
            databaseManager.clear();
            localStorage.removeItem('startFormPassed');
            this.isReady = false;
        }

        async processDbManager(credentials: Credentials): Promise<void> {
            if (this.isNewDb) {
                await databaseManager.initNew(credentials);
            } else {
                const reader = new FileReader();
                reader.onload = async function loadFunc() {
                    if (this.result && this.result instanceof ArrayBuffer) {
                        await databaseManager.initExisted(this.result, credentials);
                        await databaseManager.saveDb();
                    }
                };

                this.db && reader.readAsArrayBuffer(this.db);
            }
        }

        submit(): void {
            if (!this.validate()) {
                return;
            }

            PasswordManager.set(this.password).then((passwd: ProtectedValue) => {
                const credentials = new kdbxweb.Credentials(passwd, '');

                this.processDbManager(credentials)
                    .then(() => {
                        localStorage.setItem('startFormPassed', '1');
                        this.isReady = true;
                    })
                    .catch(() => {
                        this.password = '';
                        this.errors.password = true;
                    });
            });
        }

        processFile(e: Event): void {
            const target = e.target as HTMLInputElement;
            if (target && target.files) {
                this.db = target.files[0];
                this.fileName = this.db.name;
            }
        }

        close(): void {
            window.close();
        }

    };
</script>
