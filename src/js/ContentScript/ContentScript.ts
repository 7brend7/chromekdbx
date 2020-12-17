/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 12/10/18
 * Time: 18:09
 */

import {
    MSG_SAVE_PASS,
    NAME_REGEXP,
    TYPE_REGEXP,
    MSG_GET_PASSWORD,
    MSG_CLEAR,
    MSG_SET_CUSTOM_CONTENT,
    MSG_CHECK_PAGE_ITEM,
    POPUP_SHOW_TIMEOUT,
    DETECT_PASSWORD_FIELDS_INTERVAL,
    FILL_PASSWORD_FIELDS_INTERVAL,
    MSG_IGNORE_LIST_CHECK,
    MSG_IGNORE_LIST_SAVE
} from '../constants'
import selectorGenerator from './SelectorGenerator'
import savePopup from './SavePopup'
import PasswordItem from '../Interfaces/PasswordItem'
import PageItem from '../Interfaces/PageItems'

class ContentScript {
    private pageItems: PageItem[] = []

    constructor() {
        chrome.runtime.sendMessage({ type: MSG_IGNORE_LIST_CHECK, host: window.location.host }, (ignored: boolean) => {
            if (!ignored) {
                this.addStyles()
                this.queryPasswords()
                this.detectPasswordFields()
                this.initListeners()
                this.initLoad()
            }
        })
    }

    addStyles(): void {
        const css = document.createElement('style')
        css.innerHTML = `.chromeKdbx--input {
            background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAG3AAABtwHhm2yVAAAMXUlEQVRo3sWae3RU9bXHP+fMTCbJJJAQQkjCMyQSEl4hIKFe1PigFQnaqsiFArU+qqDWa1X6uGtdqRavtt6u1tJ6y2rVu1xV7ELUW0UQdRWEYHi/H0GUXhEIBJLJTDKTmd9v3z/mnJOZZEICF7xnrbPOnDO/fc53n99+fPf+HYNLsw0ErgMmA6VAEZADZFj/B4BG4ChwENgMfAyc5P9xywEeBrYAcpF7HfCQda+L2oyLkBkEPAbcC6TH/5GVlcWoUWWUlJQwYEAe6T4fCASDQU41nKL+8GEOHNiP39/c+Z5BYDnwK+D45XrjHuCHQEv8WywrK5df/GKp1NVtlVA4KuF2JaGwkrawkraQktY2JcE2JYHW2N7kb5f1G+rk3558WkpLyzrPSBB4EvBeavAjgZ32gwzDkJkzb5GNGzdJJKolEtHSHtEO+EBbVPwtUTnbHJXGpqg0NkelqSUqLUEl/oCS5kDsvKklKmvXfSI3Ta8RwzDiFdkBXHGpTOg24GXbISsrK1m27PdMnDgJIfY4pYW2sBAKa8IRiChBqdh156hBtJCSYpDuNemTYZLiNhCJId62pY7HfrSI3bt22M9tARYAq84HztUD+O8B/wWkut1ulixZwksvvUxh4SAEiESEQJvgb9WEwkJ7FKI6OXilhKiGUBiag5qTZxXNAY3LZZCaYpBfUMjceXfjcrnZXLsBEfECtwMNwNaLmYEfAC8CZGdns3Llm1xzzTWI9caDbUI4InFAO0Dv2rGFPbt3cObMKbRAdnYuI8snUjKyAqVjiigljkxGqsnwghTSUw0E4ZP1H/P9BbNobm6ysTwMvHAhCtwGrABc+fn5vP/+GkaPHo0IhCNCsE0nAFYa2tsjvPSnZfzt7dc5uH83SkUTbuh2exhxxRiqp81i5h33g+FOmCWtYXCem2EDPWDAvr17+Oc7ptPQcBJAWbPxVm8UKAa2AX369u3LRx99zPjx4xGBVsvOO4M/cGAvP3viAXZu/7RXEWHUmMk8tPh3FAwu7TKDuVluxhSlgAEHD+zj2zOraW46ZyfDSVYi7NYHUoAPgKFut5t3332PqqoqRCAYEsLtXcFvqdvEovtmU394X69D2pmG42ytXUvxyEqycgoT7tkcVJxt0RTkuOmfO4Cx4ytZtfI1RCQFuAr4M6C7U+BxYC7AkiVLmDdvnvPmk4H/8vj/8MgD3+XYF0c63kCKl6urZ3DHnIV8e9b93HDTnZSNnYLbk8LJ45+jtYplrkAzh/dvpXLKzaSkZiQ4fEtQ09Im5Pd3M3jIcESE2k1/B8gH/MCmZCZUCBwCfJWVldTWbsY0Xd3avNLC4kfv482/vtKRogcX8S+Ln2PK1dMdQPEOu2n9uyz/zROcOnHMkbn2W/O566EXEqJV7AjlI1IoGeRBKcWMb05h396dtildAZzoPANPAVMNw+DNN1dRWDgIpYWW1uTg9+zawXNLf0Ik0h4jRrl5LH3+VSomXZsUvNJCfmEJRSMr2LZpDeFQEICTxz9jTOU0MvoOSACvtHCyUVGQ6ybN66K0bAxvvP6ybeYGsBbAjCNm9wLU1Mx0klSwTZKCVwrWrn6b1taAo/137riHUaOv7Ba8fb2ktIrrZ9zlyIXaAmzZ+HYX8EpDe1So2xdCgIrKKqqvuyk+xOfEKzDXJmaLFy92klR3cV5pYdfOLQ6Ivln9uG3Ooh7B2/eZdsv9ZGT2c+SPHtrWBXzUkv+qMcqXDVEQWPjwYlvEB8yOV2AeQFlZGVdOrgLLcbsDrxScOd1B5YuKy/H5snoFXmkhLb0fhUNHOfLN504lBe8kxvqwNQtTGFE80habbyuQD1QCzJkz1+E2oXbdLXilBb/fyZJk9uk9ePtaui+7g0sHm7oFr7RwvCGKP6gRoObW2bbYJCDPBKrtaDRt2jcRoC0s5wWvNGitE9LJhYBXulP8Ow94pSCqof7LdkRg6tU3xkfQa02rDCQrK4ux48YjkizbdiVmEvd84cLAKyWIJBKCaA/y/zipQISyMRPIyOhjC1aZVg3LqFFlGIZh8Z3zg1caXC436b5M0n2ZqGj0gsDHjprUtEy8aZmYLleP8l+djiCAaboYUVLq1CkG8BlQNH/+Av64/M9EtXDijOoW/KGDe2lqOovWWKZkmZTECJlzrkEL1jiJ/Vaxoy2nJRZ5tOV33rQs+heUdav8PTV9SU8z+PGjd/PWylcBjriBLIDc3AExU4hy3jf/u+d/Sl3tustSsxaVVXPng290O3MtbYr0VDfZ/fo7ZbhpV1p2AX7eadcgicZ7STfp4fnhcGxMui/TCYDueE8Ua+8OvFLCuMpr8GVmO6WgSOddnP90/Hmy8QiiO673Lyg/j8/ETM4uY506wyJH/YLBYOy60T34qIa8gmFEdQyUtmZEO787QJdV3EjBkHInw65e+UvH7mPjYuC14Bwzsgq7Ba80eDwx2WCwxamb3cA5oF/D6QZEwGXSLXilhNVvv8L2ug97NIe5aVnkDSp3AL3/12d6NL+hI69lxLjvJAWvNGSkuRCBs42nbZEm04pC1NfXx1KSaSA6OXilE2bvvJvuZIq98gHoFrzHBb5UAxC+OHrYFql3WyXatAP79xGNKkzTRUqKQSgoXcArLXxr5j1UXDnNCZNih0/bNCwzGVYyOYEe1Mx7zvlPx5mgts1OC+lZg5KCV0oYnOcBBBVVHP3skK3AIbfVaH3Y729mz+5djB1fQbrX5Jw/mpQe7N+7mSMHtluO15FR450Ugaz+w8jJL3Uy7K7NK9GWls64ODkEcgdPoKD4hqTmOzTfjQjs3budQMBvK1DrBj6yZs9Yt24NY8ZV0CfD5Nip5PTgiyN72LdrQ4/mMG7KbQn04Fj9p9CDD5ie9KTgtQhlw7wIsGnDB/EW93cTOGU3jla8/pdYXes2SPcaSdN7b9OA1onK9zYRdPE9LQwZ4CE700QE3ntnhT36U+CUzQkfAn4LsHbdJ0ycVMW5Fs3+L8JduMnphuO0BgNOL8emDTFK0AE6vU8eHm+mI9946pjlE4JWoKyxWgnKohmGK40UX14CeKVgwc19KC70sHNbLQtmV9sKLAJ+byeyvwDPAL5f/8ezvPraKrIyTDJSTc62qARu8sqyJ9i38+Mu0YNOCSbJacKFZBM5cPhUrrr9Twnghw50U1zoAYHlf3g2vh2/wk5kWKsny4FH3l/9N7ZtqWPCxCspKkyhcX9bgimEQkFCbYHLQiUi7a0J4AFq/ilGcXZsr2Xj+jX20BctzLjj5H8F3Csivsd+tIi1H24mzetiaIGHQ8faHVNwe7ykeNO6cJjexPhuX7112XR5E3zu5m/4yMt2o5TimSWP2ImwxcKatLW4GPh3gMU/eZJHH/8ZCOysb+f46UiXvo3qoZI6fz2Q3GHtsWNHpHLn9RlgwIsvPM2LLzxtY3wMeL47BTyWd1e4XC7eWLmaq6ZWoxXUHQhxsjH6tYAvHpTCgpsyMU2DzRs/ZOHdNXYJux2oAiK9au5mZvZh1X9/RFn5OETD1kNhjp2IXFbw44pTub3ah2ka1B/ey/fn3EBLrIEQACZa3cOO3JFEgSPWwoZqafEzZ9YMDuzfAwZUlnoZXexF5NKDFxGmTU5n1nUZmKbB4YO7eeCum23wyupdHertCs1Baw23JhgM8NaqFYyrmMjgIcPpl2lSkOvmnF/jb9WXBPzQgW7mT+9L+TAvGLB544csuvdWms412v79A+C1C11i2gYcA2aEwyHTanEzafJVpHldFBV6yOnrItCq8Qf0BYPXIgzJ83DLVB83TPLhSzWJqih/XLaUn//rQsLhkP3mF1oh/qIX+W611skyAcpHj+epZ35LRWWsgyeAP6ip/7Kdf5xQfHUmQlu7JAXvNmFgrpth+W7Kh3nJsuiBHeeXPvlDDh/cbT/Xb3UM37kUC90lVuarADAMg+rrp/PAg48zYeI34lhojGkGWmMFeFsoBs7jiRUjvrQYn49nrju31bL8D8+ycf2a+IJnO3Cn5Y+XbKXebfGPp+zZABhRPJKaW2cz9eobKRszAdN0OfS4cx1s8/l9e7ezccMHvPfOCj4/muCXrcAvgaVA++X61CDfWsm5z+oSO1tGRh9GlJQyvOgKcnIGkObLsD41CHDmzEmOHa3n6GeH4vl8PLf5Twv81/YBSA7woFUQ6Yv40EMDtdas9vs6P/ZItg2wmsRVVqtyOJDb6XOb08DnnT63afi/Pvh/AQYg/wNw1wh6AAAAAElFTkSuQmCC');
            background-repeat: no-repeat;
            background-size: auto 50%;
            background-position: right 10px center;}`
        document.body.appendChild(css)
    }

    queryPasswords(): void {
        chrome.runtime.sendMessage({ type: MSG_GET_PASSWORD, url: document.location.href }, (data: PasswordItem[]) => {
            if (data.length > 0) {
                this.fillPasswordField(data[0]) // temporary take the first one
            }
        })
    }

    fillPasswordField(item: PasswordItem): void {
        const { nameSelector, passwordSelector } = item.selectors

        const nameField = window.top.document.querySelector(nameSelector) as HTMLInputElement
        const passwordField = window.top.document.querySelector(passwordSelector) as HTMLInputElement

        if (nameField && passwordField) {
            nameField.value = item.name
            passwordField.value = item.password
        }
        // What about dynamics forms?
        setTimeout(this.fillPasswordField.bind(this, item), FILL_PASSWORD_FIELDS_INTERVAL)
    }

    detectPasswordFields(): void {
        // eslint-disable-next-line quotes
        ;[...document.querySelectorAll<HTMLInputElement>("input[type='password']")].forEach((passwordField: HTMLInputElement) => {
            const exist = this.pageItems.find((passField: PageItem) => passwordField.isSameNode(passField.passwordField))
            if (exist) {
                return
            }

            let nameField = null
            let parent = passwordField.parentElement
            let parentCnt = 0

            while (!nameField && parent && parentCnt < 5) {
                // eslint-disable-next-line no-loop-func
                ;[...parent.querySelectorAll('input')].forEach(
                    (nameItem: HTMLInputElement) =>
                        (NAME_REGEXP.test(nameItem.name) || NAME_REGEXP.test(nameItem.id) || NAME_REGEXP.test(nameItem.placeholder)) &&
                        TYPE_REGEXP.test(nameItem.type) &&
                        nameItem.type !== 'hidden' &&
                        nameItem.offsetParent !== null &&
                        (nameField = nameItem)
                )

                parent = parent.parentElement
                parentCnt += 1
            }

            if (nameField) {
                nameField.classList.add('chromeKdbx--input')
                passwordField.classList.add('chromeKdbx--input')

                this.pageItems.push({
                    passwordField,
                    nameField
                })
            }
        })

        // What about dynamics forms?
        setTimeout(this.detectPasswordFields.bind(this), DETECT_PASSWORD_FIELDS_INTERVAL)
    }

    initListeners(): void {
        chrome.runtime.onMessage.addListener((data: any) => {
            switch (data.type) {
                default:
                    break
            }
        })

        // window.addEventListener('beforeunload', this.beforeunload.bind(this));
        window.addEventListener('unload', this.beforeunload.bind(this))
    }

    initLoad(): void {
        setTimeout(this.showPopup.bind(this), POPUP_SHOW_TIMEOUT)
    }

    showPopup(): void {
        if (!this.inIframe()) {
            chrome.runtime.sendMessage({ type: MSG_CHECK_PAGE_ITEM }, (exist: boolean) => {
                exist &&
                    savePopup.show(
                        () => {
                            chrome.runtime.sendMessage({
                                type: MSG_SAVE_PASS
                            })
                        },
                        ({ neverAsk }) => {
                            neverAsk && this.saveToIgnore()
                            chrome.runtime.sendMessage({ type: MSG_CLEAR })
                        }
                    )
            })
        }
    }

    beforeunload(): boolean {
        const pageItem = this.pageItems.find((item: PageItem) => item.passwordField.value !== '')

        pageItem &&
            chrome.runtime.sendMessage({
                type: MSG_SET_CUSTOM_CONTENT,
                name: pageItem.nameField.value,
                password: pageItem.passwordField.value,
                url: document.location.href,
                title: document.title,
                nameSelector: selectorGenerator.getQuerySelector(pageItem.nameField),
                passwordSelector: selectorGenerator.getQuerySelector(pageItem.passwordField)
            })

        return true
    }

    inIframe(): boolean {
        try {
            return window.self !== window.top
        } catch (e) {
            return true
        }
    }

    saveToIgnore(): void {
        chrome.runtime.sendMessage({
            type: MSG_IGNORE_LIST_SAVE,
            host: window.location.host
        })
    }
}

new ContentScript() // eslint-disable-line no-new
