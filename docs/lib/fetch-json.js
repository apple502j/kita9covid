export default name => {
    return fetch(`${name}.json`).then(req => {
        if (!req.ok) return Promise.reject(req.statusCode);
        return req.json()
    })
};
