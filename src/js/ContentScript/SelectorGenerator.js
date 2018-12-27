/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 27/12/18
 * Time: 15:04
 */

class SelectorGenerator {

    _getNodeString(selectors, node) {

        let str = node.tagName.toLowerCase();

        const childrenTags = [...node.parentNode.children].filter(item => item.tagName.toLowerCase() === str);

        if (str !== 'body' && childrenTags.length > 1) {
            const index = [...node.parentNode.children].indexOf(node);
            str += `:nth-child(${index + 1})`;
        }

        selectors.push(str);

        if(str !== 'body') {
            this._getNodeString(selectors, node.parentNode)
        }
    }

    getQuerySelector(node) {

        const selectors = [
            `${node.tagName.toLowerCase()}[type="${node.type}"]`
        ];

        this._getNodeString(selectors, node.parentNode);

        return selectors.reverse().join(' > ');
    }
}

export default new SelectorGenerator()
