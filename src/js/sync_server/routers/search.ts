/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 2019-09-27
 * Time: 11:37
 */
import { Request, Response, Router } from "express";
import routers from "./index";
import databaseManager from "../db/DatabaseManager";
import PageItem from "../../PageItem";
import cklog from "../cklog";
import { Entry } from "kdbxweb";
import ApiEntry from "../../Interfaces/ApiEntry";

export default (router: Router) => {

    router.post(`/${routers.search}`, async (req: Request, res: Response) => {
        try {

            if (!req.token) {
                throw new Error('No token provided');
            }
            const { entity, type, value } = req.body;

            /*let result: ApiEntry[] = await (await databaseManager.getDb(req.token)).findItemByHost(value);

            return res.json(result.map((item: ApiEntry): ApiEntry => ({
                fields: {
                    ...item.fields,
                    Password: item.fields.Password.getBinary(),
                    chrome_kdbx: item.fields.chrome_kdbx.getBinary(),
                },
            })));*/
        } catch (e) {
            cklog.error(e.message);
            res.json({error: 'Failed to search'});
        }
    });
}