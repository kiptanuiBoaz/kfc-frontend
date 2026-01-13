import React from "react";

interface UseServerPaginationOptions<T> {
    data: T[];
    pageSize?: number;
    initialPage?: number;
    delayMs?: number;
}

interface UseServerPaginationResult<T> {
    page: number;
    pageCount: number;
    isLoading: boolean;
    pageData: T[];
    goToPage: (nextPage: number) => void;
    handlePageChange: (_event: React.ChangeEvent<unknown>, value: number) => void;
}

export function useServerPagination<T>({
    data,
    pageSize = 8,
    initialPage = 1,
    delayMs = 250,
}: UseServerPaginationOptions<T>): UseServerPaginationResult<T> {
    const [page, setPage] = React.useState(initialPage);
    const [isLoading, setIsLoading] = React.useState(false);
    const [pageData, setPageData] = React.useState<T[]>([]);

    const pageCount = React.useMemo(
        () => (data.length === 0 ? 1 : Math.ceil(data.length / pageSize)),
        [data.length, pageSize]
    );

    React.useEffect(() => {
        setPage(initialPage);
    }, [data, initialPage]);

    React.useEffect(() => {
        if (page > pageCount) {
            setPage(pageCount);
        }
    }, [page, pageCount]);

    React.useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            const start = (page - 1) * pageSize;
            const end = start + pageSize;
            setPageData(data.slice(start, end));
            setIsLoading(false);
        }, delayMs);

        return () => clearTimeout(timer);
    }, [data, page, pageSize, delayMs]);

    const goToPage = React.useCallback((nextPage: number) => {
        setPage(nextPage);
    }, []);

    const handlePageChange = React.useCallback(
        (_event: React.ChangeEvent<unknown>, value: number) => {
            goToPage(value);
        },
        [goToPage]
    );

    return {
        page,
        pageCount,
        isLoading,
        pageData,
        goToPage,
        handlePageChange,
    };
}
