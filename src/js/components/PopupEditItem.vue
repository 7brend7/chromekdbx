<template>
    <div class="edit-content">
        <a href="#" @click="$emit('onClose')" class="settings-close"></a>

        test
    </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component'
import TranslationMixin from './TranslationMixin'
import { Prop } from 'vue-property-decorator'
import PopupItem from '../Interfaces/PopupItem'
import { MSG_GET_ITEM } from '../constants'
import { Entry } from 'kdbxweb'

@Component({
    name: 'PopupEditItem',
    components: {},
    props: {
        data: {
            required: true
        }
    }
})
export default class PopupSettings extends mixins(TranslationMixin) {
    @Prop({ required: true }) private data!: PopupItem

    private item: Entry | null = null

    private created(): void {
        chrome.runtime.sendMessage({ type: MSG_GET_ITEM, id: this.data.id }, (item: Entry) => {
            this.item = item
            debugger
        })
    }
}
</script>
