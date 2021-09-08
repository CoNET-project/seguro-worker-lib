export const logger = (...argv: any ) => {
    const date = new Date()
    const dateStrang = '[Seguro-worker-lib INFO '
    + `${date.getHours()}:${date.getMinutes()}:`
    + `${date.getSeconds()}:${date.getMilliseconds()}] `
    /* eslint-disable no-console */
    return console.log(dateStrang, ...argv)
    /* eslint-enable no-console */
}
