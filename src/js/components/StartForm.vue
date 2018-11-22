<template>
    <main id="app" class="startForm">
        <input type="file" @change="processFile($event)" />
        <input v-model="password" type="password" />
        <button type="button" @click="openDbFile">Go</button>
    </main>
</template>

<script>
    import kdbxweb from 'kdbxweb';

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
                        console.log('DB loaded');
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
