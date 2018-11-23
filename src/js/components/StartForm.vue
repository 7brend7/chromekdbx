<template>
    <main id="app">
        <div class="startForm">
            <div class="startForm--logo">
                <img src="/static/img/Logoedit.png" alt="logo">
            </div>
            <div class="startForm--divider"></div>
            <div class="startForm--form">
                <div class="startForm--formAlign">
                    <label>Please choose your existing kdbx database:</label>

                    <label class="startForm--formFileContainer">
                        <input type="text" placeholder="Click here to trigger the file uploader" v-model="fileName" :class="[{'error': checkError('db')}]" />
                        <input type="file" @change="processFile($event)" />
                    </label>

                    <label class="startForm--formFileContainerNote">
                        Don't have such? <a href="#" @click="generateDb">click here</a>.
                    </label>

                    <div class="startForm--divider-H"></div>

                    <label>Password for database:</label>
                    <input v-model="password" type="password"  :class="[{'error': checkError('password')}]" />
                    <button class="startForm--formFileContainerContinueBtn" type="button" @click="openDbFile">Continue</button>
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
                db: null,
                errors: {}
            }
        },
        methods: {
            checkError: function(name) {
                return typeof this.errors[name] != 'undefined';
            },
            generateDb: function(e) {


                e.preventDefault();
            },
            validate: function() {
                this.errors = {};

                for (let value of ['db', 'password']) {
                    if(!this[value]) {
                        this.errors[value] = true;
                    }
                }

                return Object.keys(this.errors).length == 0;
            },
            openDbFile: function() {
                if (!this.validate()) {
                    return;
                }

                const reader = new FileReader();
                const passwd = this.password;

                reader.onload = function() {
                    const arrayBuffer = this.result;
                    const credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(passwd), null);
                    kdbxweb.Kdbx.load(arrayBuffer, credentials).then(db => {
                        console.log('DB loaded');
                    });

                };

                reader.readAsArrayBuffer(this.db);
            },
            processFile: function() {
                this.db = event.target.files[0];
                this.fileName = this.db.name;
            }
        }
    }
</script>
