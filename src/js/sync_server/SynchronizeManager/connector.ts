/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 2019-11-04
 * Time: 11:42
 */
import ISynchronizeManagerConnector from '../../SynchronizeManager/Interfaces/ISynchronizeManagerConnector'

class SynchronizeManagerConnector implements ISynchronizeManagerConnector {
    setItem(key: string, value: string): void {

    }

    getItem(key: string): string | null {
        return ''
    }
}

export default new SynchronizeManagerConnector()
