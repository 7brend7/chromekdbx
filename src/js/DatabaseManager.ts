/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 2019-08-13
 * Time: 09:45
 */

import IDatabaseManager from "./Interfaces/IDatabaseManager";
import LocalDatabaseManager from './LocalDatabaseManager';
import ApiDatabaseManager from './ApiDatabaseManager';
import DbConnector from './DbConnector';

class DatabaseManager {

    static init(): IDatabaseManager {

        const connectionType = <'local' | 'api'>localStorage.getItem('connectionType') || 'local';
        if (connectionType === "api") {
            return new ApiDatabaseManager();
        }

        return new LocalDatabaseManager(new DbConnector());
    }
}

//export default DatabaseManager.init(<'local' | 'api'>localStorage.getItem('connectionType') || 'local');
export default DatabaseManager;
