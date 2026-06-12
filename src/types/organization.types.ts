import { AuthUser, TRole } from "./auth.types";

export interface OrganizationUser extends AuthUser {
    organization_guid?: string;
}

export interface CreateOrganizationUserPayload {
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
    role: string; // role guid
    is_active: boolean;
    organization?: string;
    organization_guid?: string;
}

export interface UpdateOrganizationUserPayload extends Partial<CreateOrganizationUserPayload> {
    guid: string;
}
