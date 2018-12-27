<template>
    <main id="app">
        <div class="startForm">
            <div class="startForm--logo">
                <img src="/static/img/Logoedit.webp" alt="logo">
            </div>
            <div class="startForm--divider"></div>
            <div class="startForm--form">
                <div class="startForm--formAlign">
                    <span v-if="isReady">
                        <label class="startForm--readyToStartLbl">{{getMsg('startForm_ready_to_start')}}</label>
                        <p class="startForm--readyToStartMessage">{{getMsg('startForm_ready_to_message')}}</p>
                        <p @click.prevent="readyToStartHandler" v-html="getMsg('startForm_ready_to_download')"></p>

                        <button class="startForm--closeBtn" type="button" @click="close">{{getMsg('startForm_close')}}</button>
                    </span>
                    <span v-else>
                        <span v-if="!isNewDb">
                            <label>{{getMsg('startForm_choose_db')}}</label>

                            <label class="startForm--formFileContainer">
                                <input type="text" :placeholder="getMsg('startForm_file_placeholder')" v-model="fileName" :class="[{'error': checkError('db')}]"/>
                                <input type="file" @change="processFile($event)"/>
                            </label>

                            <label class="startForm--formFileContainerNote">
                                {{getMsg('startForm_dont_have_such')}} <a href="#" @click.prevent="switchDb(true)">{{getMsg('startForm_click_here')}}</a>.
                            </label>
                        </span>

                        <span v-else>
                            <span v-html="getMsg('startForm_create_db_intro')"></span>
                            <label class="startForm--formFileContainerNote">
                                {{getMsg('startForm_still_open_db')}} <a href="#" @click.prevent="switchDb(false)">{{getMsg('startForm_click_here')}}</a>.
                            </label>
                        </span>

                        <div class="startForm--divider-H"></div>

                        <label>{{getMsg('startForm_password')}}</label>
                        <input v-model="password" type="password" :class="[{'error': checkError('password')}]"/>

                        <label v-if="isNewDb">{{getMsg('startForm_repeat_password')}}</label>
                        <input v-if="isNewDb" v-model="re_password" type="password" :class="[{'error': checkError('re_password')}]"/>

                        <button class="startForm--formFileContainerContinueBtn" type="button" @click="submit">{{getMsg('startForm_continue')}}</button>
                    </span>

                </div>
            </div>
        </div>
    </main>
</template>

<script>
    import kdbxweb from 'kdbxweb';
    import databaseManager from '../DatabaseManager';
    import passwordManager from '../PasswordManager';

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
                errors: {}
            }
        },
        created: function () {
            this.isReady = localStorage.getItem('startFormPassed') || false;
        },
        methods: {
            checkError: function (name) {
                return typeof this.errors[name] != 'undefined';
            },
            switchDb: function (isNewDb) {
                this.errors = {};
                this.isNewDb = isNewDb;
            },
            validate: function () {
                this.errors = {};
                let validationFields = this.isNewDb ? ['password', 're_password'] : ['db', 'password'];

                for (let value of validationFields) {
                    if (!this[value]) {
                        this.errors[value] = true;
                    }
                }

                this.isNewDb && this.password !== this.re_password && (this.errors['re_password'] = true);

                return Object.keys(this.errors).length == 0;
            },
            readyToStartHandler: function(e) {
                if (e.target.tagName.toLowerCase() === 'a') {
                    switch (e.target.dataset.type) {
                        case 'download': this.downloadDb(); break;
                        case 'clear': this.clearAll(); break;
                    }
                }
            },
            downloadDb: function() {
                databaseManager.reset();
                databaseManager.getBinary().then(data => {
                    const blob = new Blob([data], {type: "application/octet-stream"});
                    const link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);
                    link.download = 'chromeKdbxDb.kdbx';
                    link.click();
                });
            },
            clearAll: function() {
                passwordManager.clear();
                databaseManager.clear();
                localStorage.removeItem('startFormPassed');
                this.isReady = false;
            },
            processDbManager: async function(credentials) {
                return new Promise((res, rej) => {
                    if (this.isNewDb) {
                        res(databaseManager.initNew(credentials));
                    }
                    else {
                        const reader = new FileReader();
                        reader.onload = async function () {
                            const arrayBuffer = this.result;
                            console.log('start');
                            await databaseManager.initExisted(arrayBuffer, credentials);
                            console.log('start2');
                            await databaseManager.saveDb();
                            console.log('start3');
                            res();
                        };

                        reader.readAsArrayBuffer(this.db);
                    }
                });
            },
            submit: function () {
                if (!this.validate()) {
                    return;
                }

                passwordManager.set(this.password).then(passwd => {
                    const credentials = new kdbxweb.Credentials(passwd, null);

                    this.processDbManager(credentials)
                        .then(() => {
                            console.log('end');
                            localStorage.setItem('startFormPassed', '1');
                            this.isReady = true;
                        })
                        .catch((err) => {
                            this.password = null;
                            this.errors['password'] = true;
                        });

                });
            },
            processFile: function () {
                this.db = event.target.files[0];
                this.fileName = this.db.name;
            },
            close: function() {
                window.close();
            }
        }
    }
</script>
