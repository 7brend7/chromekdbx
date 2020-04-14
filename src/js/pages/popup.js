import Vue from 'vue'

import Popup from '../components/Popup'

new Vue({
    render(createElement) {
        return createElement(Popup)
    },
}).$mount('#app')
