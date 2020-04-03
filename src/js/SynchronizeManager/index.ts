/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 2019-11-04
 * Time: 10:13
 */
import ISynchronizeManagerConnector from './Interfaces/ISynchronizeManagerConnector';

class SynchronizeManager {

    private key = 'sync_time';

    private connector: ISynchronizeManagerConnector;

    constructor(connector: ISynchronizeManagerConnector) {
        this.connector = connector;
    }

    setTimestamp(time: Date = new Date()): number {
        const result = time.getTime();
        this.connector.setItem(this.key, result.toString());
        return result;
    }

    getCurrentTimestamp(): number {
        const result = this.connector.getItem(this.key);
        return result ? parseInt(result) : this.setTimestamp();
    }
}

export default SynchronizeManager;