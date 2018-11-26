<template>
    <main id="app">
        <div class="startForm">
            <div class="startForm--logo">
                <img src="/static/img/Logoedit.png" alt="logo">
            </div>
            <div class="startForm--divider"></div>
            <div class="startForm--form">
                <div class="startForm--formAlign">
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

                    <button class="startForm--formFileContainerContinueBtn" type="button" @click="openDbFile">{{getMsg('startForm_continue')}}</button>
                </div>
            </div>
        </div>
    </main>
</template>

<script>
    import kdbxweb from 'kdbxweb';

    export default {
        data() {
            return {
                fileName: '',
                password: null,
                re_password: null,

                isNewDb: false,

                db: null,
                errors: {}
            }
        },
        methods: {
            getMsg: function(text) {
                return chrome.i18n.getMessage(text);
            },
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
            openDbFile: function () {
                if (!this.validate()) {
                    return;
                }

                const reader = new FileReader();
                const passwd = this.password;

                reader.onload = function () {
                    const arrayBuffer = this.result;
                    const credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(passwd), null);
                    kdbxweb.Kdbx.load(arrayBuffer, credentials).then(db => {
                        console.log('DB loaded');
                    });

                };

                reader.readAsArrayBuffer(this.db);
            },
            processFile: function () {
                this.db = event.target.files[0];
                this.fileName = this.db.name;
            }
        }
    }
</script>
