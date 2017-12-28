export function windowScrollX() {
    return (window.pageXOffset !== undefined) ? window.pageXOffset :
        (document.documentElement || document.body.parentNode || document.body).scrollLeft;
}

export function windowScrollY() {
    return (window.pageYOffset !== undefined) ? window.pageYOffset :
        (document.documentElement || document.body.parentNode || document.body).scrollTop;
}