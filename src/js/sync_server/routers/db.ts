import { Request, Response, Router } from 'express';

import cklog from '../cklog';

import databaseManager from "../db/DatabaseManager";
import routers from '.';

export default (router: Router) => {

    /**
     * @swagger
     * /api/v1/db:
     *     post:
     *         summary: initialize database instance
     *         security:
     *             - ApiKeyAuth: []
     */
    /*router.post(`/${routers.db}`, async (req: Request, res: Response) => {

        try {
            const { name: dbName, password } = req.body;

            databaseManager.initCredentials(dbName, password);

            await databaseManager.initDb();

            res.json({
                success: true,
                message: '',
            });
        }
        catch (e) {
            cklog.error(e.message);
            res.json({
                success: false,
                message: "Can't connect to db with such credentials",
            });
        }
    });*/

    router.get(`/${routers.db}`, async (req: Request, res: Response) => {
        try {
            if (!req.token) {
                throw new Error('No token provided');
            }

            const data = await databaseManager.getBinary(req.token);

            res.set('Content-Type', 'application/octet-stream');
            res.send(Buffer.from(data));
        } catch (e) {
            cklog.error(e.message);
            res.json({error: "Can't connect to db"});
        }
    });

    router.put(`/${routers.db}/sync`, async (req: Request, res: Response) => {
        try {
            if (!req.token) {
                throw new Error('No token provided');
            }

            const db: ArrayBuffer = (new Int8Array(Object.values(req.body.db))).buffer;
            const { time }: { time: number } = req.body;

            await databaseManager.synchronize(req.token, db, time);

            return res.json({
                db: new Int8Array(await databaseManager.getBinary(req.token)),
                time: databaseManager.getSyncTime(req.token),
            });
        } catch (e) {
            cklog.error(e.message);
            res.json({ error: "Can't connect to db" });
        }
    });
}