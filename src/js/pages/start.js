import Vue from 'vue'

import StartForm from '../components/StartForm'

new Vue({
    render(createElement) {
        return createElement(StartForm)
    },
}).$mount('#app')
