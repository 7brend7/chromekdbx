/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 2019-09-28
 * Time: 23:12
 */

import { StringProtected } from 'kdbxweb';

export default interface ApiEntry {
    fields: { [key: string]: StringProtected };
}