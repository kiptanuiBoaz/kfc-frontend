export const toSentenceCase = (string: string): string => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase().trim().replace(/_/g, " ");
}