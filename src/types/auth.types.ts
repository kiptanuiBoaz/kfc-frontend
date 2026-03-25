export interface User {
    guid: string;
    image: string | null;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    role: string | null;
    is_active: boolean;
    is_first_time_login: boolean;
    created_at: string;
    created_by: string;
    updated_at: string;
    updated_by: string | null;
    bio: string | null;
}

export interface AuthUser {
    guid: string;
    image: string | null;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    role: TRole | null;
    is_active: boolean;
    is_first_time_login: boolean;
    created_at: string;
    bio: string | null;
}

export interface AuthTokens {
    access: string;
    refresh: string;
    type: string;
    expires_in: number;
}

export interface LoginResponse {
    access: string;
    refresh: string;
    type: string;
    expires_in: number;
    user: AuthUser;
}

interface AuthState {
    user: AuthUser | null;
    tokens: AuthTokens | null;
    is_authenticated: boolean;
    isLoading: boolean;
    isRestoring: boolean;
}

export interface TRole {
    id: number,
    guid: string,
    name: string,
    description: string,
    permission_id: string[],
    created_at: string,
    created_by: string,
    updated_at: string,
    updated_by: string | null,
    deleted_at: string | null,
    deleted_by: string | null,
}

export interface TImageUpdateRes {
    status: string;
    image: string;
    message: string;
}

export default AuthState;


export interface TOrgSignUpResponse {
    status: string,
    message: string,
    data: {
        guid: string,
        member_id: string,
        org_name: string,
        address: string,
        is_active: boolean,
        registration_link: string,
        created: boolean
    }
}