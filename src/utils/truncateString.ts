export const truncateString = (str: string, maxLength: number = 100): string => {
    if (str.length <= maxLength) {
        return str;
    }
    return str.slice(0, maxLength) + "...";
};