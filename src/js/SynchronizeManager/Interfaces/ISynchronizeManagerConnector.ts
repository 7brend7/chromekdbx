/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 2019-11-04
 * Time: 11:55
 */

export default interface ISynchronizeManagerConnector {
    setItem(key: string, value: string): void
    getItem(key: string): string | null
}
