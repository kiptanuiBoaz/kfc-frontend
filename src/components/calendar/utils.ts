export const isPast = (start: string) => {
    const now = new Date();
    const startDate = new Date(start);
    const eventDate = new Date(startDate as Date);
    // @ts-ignore
    return eventDate < now.setHours(0, 0, 0, 0)
};