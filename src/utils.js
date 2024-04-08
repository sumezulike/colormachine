
export function isFloat(val) {
    const floatRegex = /^-?\d+(?:[.,]\d*?)?$/;
    if (!floatRegex.test(val))
        return false;

    val = parseFloat(val);
    return !isNaN(val);

}

export function clamp(a, x, b) {
    return Math.max(a, Math.min(x, b))
}
