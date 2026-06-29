export const shortOrderId = (id?: string) => {
    if (!id) return "";
    return id.slice(-4).toUpperCase();
};