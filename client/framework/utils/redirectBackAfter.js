export default function redirectBackAfter(path, state) {
    return ['/login', { redirectTo: state.location }];
}
