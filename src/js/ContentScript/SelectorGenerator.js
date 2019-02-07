/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 27/12/18
 * Time: 15:04
 */

class SelectorGenerator {


    constructor() {
        this.selectorPatterns = [
            {
                method: this.patternId.bind(this),
                stopChaining: true,
            },
            {
                method: this.patternTagName.bind(this),
                stopChaining: false,
            },
            {
                method: this.patternClass.bind(this),
                stopChaining: true,
            },
            {
                method: this.patternChild.bind(this),
                stopChaining: true,
            },
        ];

        this.reset();
    }

    _getNodeString(selectors, node) {
        let str = '';

        // eslint-disable-next-line no-restricted-syntax
        for (const rule of this.selectorPatterns) {
            const ruleStr = rule.method(node);
            ruleStr !== false && (str += ruleStr);

            if ((ruleStr !== false && rule.stopChaining) || this.stopPropagation) {
                break;
            }
        }

        str !== '' && selectors.push(str);

        !this.stopPropagation && this._getNodeString(selectors, node.parentNode);
    }

    reset() {
        this.stopPropagation = false;
    }

    getQuerySelector(node) {
        this.reset();

        const selectors = [];

        this._getNodeString(selectors, node);

        return selectors.reverse().join(' > ');
    }

    patternId(node) {
        const { id } = node;

        if (typeof id === 'string' && id !== '') {
            this.stopPropagation = true;

            return `#${id}`;
        }

        return false;
    }

    patternTagName(node) {
        const tag = node.tagName.toLowerCase();

        (tag === 'body') && (this.stopPropagation = true);

        return tag;
    }

    patternClass(node) {
        const classList = Array.from(node.classList);

        if (classList.length > 0) {
            const classStr = `.${classList.join('.')}`;

            return (node.parentNode && Array.from(node.parentNode.querySelectorAll(classStr)).length === 1) ? classStr : false;
        }

        return false;
    }

    patternChild(node) {
        const childrenTags = [...node.parentNode.children].filter(item => item.tagName.toLowerCase() === node.tagName.toLowerCase());

        if (childrenTags.length > 1) {
            const index = [...node.parentNode.children].indexOf(node);
            return `:nth-child(${index + 1})`;
        }

        return false;
    }

}

export default new SelectorGenerator();
