/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 12/2/18
 * Time: 18:40
 */

export default {
    methods: {
        getMsg: function(text) {
            return chrome.i18n.getMessage(text);
        },
    }
}