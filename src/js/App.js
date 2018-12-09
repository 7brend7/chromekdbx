import listenersManager from './ListenersManager';
import databaseManager from './DatabaseManager';

class App {

    start() {
        databaseManager.openDb().then(db => {
            const startFormPassed = localStorage.getItem('startFormPassed') || false;
            if (!db && startFormPassed) {
                localStorage.removeItem('startFormPassed');
            }
            console.log(db);
        });
    }
}

export default new App();
