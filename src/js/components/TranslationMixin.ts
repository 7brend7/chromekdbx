/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 12/2/18
 * Time: 18:40
 */

import Vue from 'vue'
import Component from 'vue-class-component'
import { getTranslation } from '../utils'

@Component
export default class TranslationMixin extends Vue {
    getMsg = getTranslation
}
