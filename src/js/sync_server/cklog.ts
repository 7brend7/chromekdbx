
import chalk from 'chalk'

class CkLog {
    log(message: string): void {
        console.log(message)
    }

    notice(message: string): void {
        this.log(chalk.yellow(message))
    }

    error(message: string): void {
        console.error(chalk.red(message))
    }

    success(message: string): void {
        this.log(chalk.green(message))
    }
}

export default new CkLog()
