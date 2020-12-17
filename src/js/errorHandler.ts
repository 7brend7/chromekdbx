class ErrorHandler {
    private errors: Set<string> = new Set()

    public add(value: string): void {
        chrome.browserAction.setIcon({ path: 'static/icons/keepass_error.png' })

        this.errors.add(value)
    }
}

export default new ErrorHandler()
