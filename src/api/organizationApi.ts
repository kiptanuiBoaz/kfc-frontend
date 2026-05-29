import { apiClient } from "./apiClient";
import { 
    CreateOrganizationUserPayload, 
    UpdateOrganizationUserPayload, 
    OrganizationUser 
} from "@/types/organization.types";
import { TCoursePrviewDetails, TEnrolledCourse } from "@/types/course.types";

export const organizationApi = {
    getOrganizationUsers: async () => {
        const response = await apiClient.get<OrganizationUser[]>("/main/v1/organization/users/all/");
        return response || [];
    },

    getOrganizationCourses: async () => {
        const response = await apiClient.get<TCoursePrviewDetails[]>("/main/v1/courses/");
        return response || [];
    },

    getUserEnrolledCourses: async (userGuid: string) => {
        const response = await apiClient.get<TEnrolledCourse[]>(`/main/v1/users/${userGuid}/courses/`);
        return response || [];
    },

    assignCoursesToUsers: async (userGuids: string[], courseGuids: string[]) => {
        return await apiClient.post("/main/v1/organization/enrollments/bulk/", {
            user_guids: userGuids,
            course_guids: courseGuids,
        });
    },

    assignCourseToUser: async (userGuid: string, courseGuid: string) => {
        return await apiClient.post("/main/v1/enroll/", {
            user: userGuid,
            course: courseGuid,
        });
    },

    removeCourseFromUser: async (userGuid: string, courseGuid: string) => {
        return await apiClient.delete(`/main/v1/enrollments/${userGuid}/${courseGuid}/`);
    },

    createOrganizationUser: async (data: CreateOrganizationUserPayload) => {
        return await apiClient.post<OrganizationUser>("/main/v1/user/admin_create/", data);
    },

    updateOrganizationUser: async ({ guid, ...data }: UpdateOrganizationUserPayload) => {
        // Often update endpoints are generic: /main/v1/user/update/{guid}/
        return await apiClient.patch<OrganizationUser>(`/main/v1/user/update/${guid}/`, data);
    },

    toggleUserStatus: async (guid: string, is_active: boolean) => {
        return await apiClient.patch<OrganizationUser>(`/main/v1/user/update/${guid}/`, { is_active });
    },
};
