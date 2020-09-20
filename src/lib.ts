/**
 * 返回 hello 开头的字符串
 * @param str - input string
 * @returns 'hello xxx'
 * @example
 * ```ts
 * myFirstFunc('ts') => 'hello ts'
 * ```
 * 
 */
function myFirstFunc (str: string) {
    return `hello ${str}`
}

function writeBytes(str: string) {
    console.log(str);
}

export {
    myFirstFunc,
    writeBytes
}