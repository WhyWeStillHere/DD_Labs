export function tryAndReturn(
    func,
    defaultResult = null,
    catchFunc = (e) => {}
) {
    let result = defaultResult

    try {
        result = func()
    } catch (e) {
        catchFunc(e)
    }

    return result
}
