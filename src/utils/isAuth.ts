import { PATHS } from "@/navigation/paths";

export const isAuthEndPoint = (location: string) => {
    return location.includes("/auth/login") ||
        location.includes("/auth/logout") ||
        location.includes("/auth/signup") ||
        location.includes("/auth/csrf")

}


export const isAuthUrl = (url: string) => {
    return url.includes(PATHS.LOGIN) ||
        url.includes(PATHS.SIGN_UP) ||
        url.includes(PATHS.RESET_PASSWORD)

}

