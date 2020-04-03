/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 2/26/19
 * Time: 11:50
 */

export default interface PasswordItem {
    name: string
    password: string
    selectors: {
        nameSelector: string,
        passwordSelector: string,
    }
}
