export function formatDate(date: number) {
    const dateString = date.toString();
    return `${dateString.substring(0, 4)}-${dateString.substring(4, 6)}-${dateString.substring(6, 8)}`;
}

export function formatPrice(price: number) {
    return price.toFixed(2).toString();
}
