<template>
    <main id="app" class="startForm">
        <input type="file" @change="processFile($event)" />
        <input v-model="password" type="password" />
        <button type="button" @click="openDbFile">Go</button>
    </main>
</template>

<script>
    import kdbxweb from 'kdbxweb';
    import argon2 from 'argon2-browser';

    kdbxweb.CryptoEngine.argon2 = argon2;

    export default {
        data() {
            return {
                password: null,
                db: null,
            }
        },
        methods: {
            openDbFile: function() {
                const reader = new FileReader();
                const passwd = this.password;

                reader.onload = function() {
                    const arrayBuffer = this.result;
                    const credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(passwd), null);
                    kdbxweb.Kdbx.load(arrayBuffer, credentials).then(db => {

                    });

                };

                reader.readAsArrayBuffer(this.db);
            },
            processFile: function() {
                this.db = event.target.files[0];
            }
        }
    }
</script>
