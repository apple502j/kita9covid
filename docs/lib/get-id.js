export default () => {
    const url = new URL(location.href);
    const id = url.searchParams.get("id");
    if (id) {
        const numberId = parseInt(id);
        if (Number.isNaN(numberId) || numberId < 0) return null;
        return numberId;
    }
    return null;
};
