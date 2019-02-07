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

<script>
    import kdbxweb from 'kdbxweb';
    import databaseManager from '../DatabaseManager';
    import PasswordManager from '../PasswordManager';

    import TranslationMixin from './TranslationMixin';

    export default {
        mixins: [TranslationMixin],
        data() {
            return {
                fileName: '',
                password: null,
                re_password: null,

                isNewDb: false,
                isReady: false,

                db: null,
                errors: {},
            };
        },
        created() {
            this.isReady = localStorage.getItem('startFormPassed') || false;
        },
        methods: {
            checkError(name) {
                return typeof this.errors[name] !== 'undefined';
            },
            switchDb(isNewDb) {
                this.errors = {};
                this.isNewDb = isNewDb;
            },
            validate() {
                this.errors = {};
                const validationFields = this.isNewDb ? ['password', 're_password'] : ['db', 'password'];

                validationFields.forEach((value) => {
                    if (!this[value]) {
                        this.errors[value] = true;
                    }
                });

                this.isNewDb && this.password !== this.re_password && (this.errors.re_password = true);

                return Object.keys(this.errors).length === 0;
            },
            readyToStartHandler(e) {
                if (e.target.tagName.toLowerCase() === 'a') {
                    switch (e.target.dataset.type) {
                        case 'download': this.downloadDb(); break;
                        case 'clear': this.clearAll(); break;
                        default: break;
                    }
                }
            },
            downloadDb() {
                databaseManager.reset();
                databaseManager.getBinary().then((data) => {
                    const blob = new Blob([data], { type: 'application/octet-stream' });
                    const link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);
                    link.download = 'chromeKdbxDb.kdbx';
                    link.click();
                });
            },
            clearAll() {
                PasswordManager.clear();
                databaseManager.clear();
                localStorage.removeItem('startFormPassed');
                this.isReady = false;
            },
            async processDbManager(credentials) {
                return new Promise((res, rej) => {
                    if (this.isNewDb) {
                        res(databaseManager.initNew(credentials));
                    } else {
                        const reader = new FileReader();
                        reader.onload = async function loadFunc() {
                            try {
                                const arrayBuffer = this.result;
                                await databaseManager.initExisted(arrayBuffer, credentials);
                                await databaseManager.saveDb();
                                res();
                            } catch (e) {
                                rej(e);
                            }
                        };

                        reader.readAsArrayBuffer(this.db);
                    }
                });
            },
            submit() {
                if (!this.validate()) {
                    return;
                }

                PasswordManager.set(this.password).then((passwd) => {
                    const credentials = new kdbxweb.Credentials(passwd, null);

                    this.processDbManager(credentials)
                        .then(() => {
                            // eslint-disable-next-line no-console
                            console.log('end');
                            localStorage.setItem('startFormPassed', '1');
                            this.isReady = true;
                        })
                        .catch(() => {
                            this.password = null;
                            this.errors.password = true;
                        });
                });
            },
            processFile(e) {
                [this.db] = e.target.files;
                this.fileName = this.db.name;
            },
            close() {
                window.close();
            },
        },
    };
</script>
