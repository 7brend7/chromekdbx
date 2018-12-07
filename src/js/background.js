import './listeners';
import databaseManager from './DatabaseManager';

databaseManager.openDb().then(db => {
    const startFormPassed = localStorage.getItem('startFormPassed') || false;
    if (!db && startFormPassed) {
        localStorage.removeItem('startFormPassed');
    }
    console.log(db);
});