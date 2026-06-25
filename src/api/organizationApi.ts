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
        const response = await apiClient.get<TCoursePrviewDetails[]>("/main/v1/organization/courses/");
        return response || [];
    },

    getOrganizationEnrollments: async (_orgGuid?: string) => {
        // Uses the dedicated org courses endpoint which returns courses with enrollment counts
        try {
            const courses = await apiClient.get<any[]>('/main/v1/organization/courses/');
            return Array.isArray(courses) ? courses : [];
        } catch (err) {
            console.warn('Failed to fetch organization enrollments:', err);
            return [];
        }
    },

    getUserEnrolledCourses: async (userGuid: string) => {
        try {
            const response = await apiClient.get<TEnrolledCourse[]>(`/main/v1/organization/members/${userGuid}/courses/`);
            return response || [];
        } catch (err: any) {
            console.error('Failed to fetch user enrolled courses:', err);
            return [];
        }
    },

    assignCoursesToUsers: async (userGuids: string[], courseGuids: string[]) => {
        // Use the per-member enrollment endpoint for each user
        const results = [];
        for (const userGuid of userGuids) {
            const result = await apiClient.post("/main/v1/organization/enrollments/member/", {
                user_guid: userGuid,
                course_guids: courseGuids,
            });
            results.push(result);
        }
        return results;
    },

    assignCourseToUser: async (userGuid: string, courseGuid: string) => {
        return await apiClient.post("/main/v1/organization/enrollments/member/", {
            user_guid: userGuid,
            course_guids: [courseGuid],
        });
    },

    // Unenroll the currently authenticated user from a course
    unenrollCurrentUser: async (courseGuid: string) => {
        return await apiClient.delete(`/main/v1/unenroll/${courseGuid}/`);
    },

    // Unenroll a specific org member from a specific course
    removeCourseFromUser: async (userGuids: string[], courseGuids: string[]) => {
        // For single user/course removal, use the dedicated DELETE endpoint
        if (userGuids.length === 1 && courseGuids.length === 1) {
            return await apiClient.delete(`/main/v1/organization/enrollments/member/${userGuids[0]}/${courseGuids[0]}/`);
        }
        // For bulk removals, iterate through each pair
        const results = [];
        for (const userGuid of userGuids) {
            for (const courseGuid of courseGuids) {
                try {
                    const result = await apiClient.delete(`/main/v1/organization/enrollments/member/${userGuid}/${courseGuid}/`);
                    results.push(result);
                } catch (err) {
                    console.warn(`Failed to unenroll user ${userGuid} from course ${courseGuid}:`, err);
                    throw err;
                }
            }
        }
        return results;
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

    deleteUser: async (guid: string) => {
        return await apiClient.delete(`/main/v1/user/delete/${guid}/`);
    },
};
