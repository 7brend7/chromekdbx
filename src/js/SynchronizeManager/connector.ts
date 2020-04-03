/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 2019-11-04
 * Time: 11:42
 */
import ISynchronizeManagerConnector from './Interfaces/ISynchronizeManagerConnector'

class SynchronizeManagerConnector implements ISynchronizeManagerConnector {

    setItem(key: string, value: string): void {
        localStorage.setItem(key, value)
    }

    getItem(key: string): string | null {
        return localStorage.getItem(key)
    }
}

export default new SynchronizeManagerConnector()
