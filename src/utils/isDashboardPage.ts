/**
 * Returns true when the provided path/URL is a dashboard page.
 *
 * A dashboard page is any route whose pathname is exactly `/dashboard`
 * or starts with `/dashboard/`.
 */
export const isDashboardPage = (pathOrUrl: string): boolean => {
    if (!pathOrUrl) return false;

    let pathname = pathOrUrl.trim();

    // If a full URL is provided, extract the pathname.
    try {
        pathname = new URL(pathname).pathname;
    } catch {
        // Not a full URL; keep as-is.
    }

    // Strip querystring / hash if present.
    pathname = pathname.split("?")[0].split("#")[0];

    // Normalize missing leading slash.
    if (!pathname.startsWith("/")) pathname = `/${pathname}`;

    return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
};
