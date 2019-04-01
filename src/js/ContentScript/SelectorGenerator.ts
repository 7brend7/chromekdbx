/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 27/12/18
 * Time: 15:04
 */

/**
 * Generate string selector for node element
 * Almost same as Devtool -> Copy selector
 */
class SelectorGenerator {

    private readonly selectorPatterns: {
        method: (node: Element) => false | string,
        stopChaining: boolean,
    }[];

    private stopPropagation: boolean = false;

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

    private getNodeString(selectors: string[], node: Element): void {
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

        !this.stopPropagation && node.parentNode && this.getNodeString(selectors, node.parentNode as Element);
    }

    private reset() {
        this.stopPropagation = false;
    }

    private patternId(node: Element): false | string {
        const { id } = node;

        if (typeof id === 'string' && id !== '') {
            this.stopPropagation = true;

            return `#${id}`;
        }

        return false;
    }

    private patternTagName(node: Element): false | string {
        const tag = node.tagName.toLowerCase();

        (tag === 'body') && (this.stopPropagation = true);

        return tag;
    }

    private patternClass(node: Element): false | string {
        const classList = Array.from(node.classList);

        if (classList.length > 0) {
            const classStr = `.${classList.join('.')}`;

            return (node.parentNode && Array.from(node.parentNode.querySelectorAll(classStr)).length === 1) ? classStr : false;
        }

        return false;
    }

    private patternChild(node: Element): false | string {
        if (node.parentNode) {
            const childrenTags = [...node.parentNode.children].filter(item => item.tagName.toLowerCase() === node.tagName.toLowerCase());

            if (childrenTags.length > 1) {
                const index = [...node.parentNode.children].indexOf(node);
                return `:nth-child(${index + 1})`;
            }
        }

        return false;
    }

    getQuerySelector(node: Element): string {
        this.reset();

        const selectors: string[] = [];

        this.getNodeString(selectors, node);

        return selectors.reverse().join(' > ');
    }
}

export default new SelectorGenerator();
