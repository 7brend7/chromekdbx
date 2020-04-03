/**
 * Created by PhpStorm.
 * User: Borys Anikiyenko
 * Date: 3/13/19
 * Time: 09:44
 */

declare module '*.html' {
    const content: string
    export default content
}

declare module '*.svg' {
    const content: any
    export default content
}
