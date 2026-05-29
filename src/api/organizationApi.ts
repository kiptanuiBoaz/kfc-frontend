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
        // Primary attempt: direct per-user endpoint (may not exist on all backend versions)
        try {
            const response = await apiClient.get<TEnrolledCourse[]>(`/main/v1/users/${userGuid}/courses/`);
            return response || [];
        } catch (err: any) {
            // If the backend doesn't expose a per-user courses endpoint, fall back to
            // checking each course's enrollments endpoint and build a user-specific list.
            try {
                const courses = await apiClient.get<TCoursePrviewDetails[]>('/main/v1/courses/');
                if (!Array.isArray(courses)) return [];

                const enrolledCourses: TEnrolledCourse[] = [];
                for (const c of courses) {
                    try {
                        const enrollments: any[] | undefined = await apiClient.get<any[]>(`/main/v1/courses/${c.guid}/enrollments/`);
                        if (Array.isArray(enrollments)) {
                            const match = enrollments.find((e) => {
                                // support multiple possible shapes: { user_guid }, { user: { guid } }, { user_guid: '...' }
                                if (!e) return false;
                                if (e.user_guid && e.user_guid === userGuid) return true;
                                if (e.user && e.user.guid && e.user.guid === userGuid) return true;
                                if (e.user?.guid === userGuid) return true;
                                return false;
                            });
                            if (match) {
                                enrolledCourses.push({
                                    guid: c.guid,
                                    title: c.title,
                                    description: c.description,
                                    category: c.category,
                                    image: c.image || null,
                                    status: c.status,
                                    enrolled_at: match.enrolled_at || new Date().toISOString(),
                                    expertise_level: c.expertise_level || '',
                                    course_progress: 0,
                                    instructor: {
                                        name: c.instructor_details?.first_name || '',
                                        email: c.instructor_details?.email || '',
                                    },
                                } as TEnrolledCourse);
                            }
                        }
                    } catch (innerErr) {
                        // ignore per-course failures and continue
                        console.warn(`Failed to fetch enrollments for course ${c.guid}:`, innerErr);
                    }
                }

                return enrolledCourses;
            } catch (fallbackErr) {
                console.error('Failed to fetch enrolled courses for user (fallback):', fallbackErr);
                return [];
            }
        }
    },

    assignCoursesToUsers: async (userGuids: string[], courseGuids: string[]) => {
        return await apiClient.post("/main/v1/organization/enrollments/bulk/", {
            user_guids: userGuids,
            course_guids: courseGuids,
        });
    },

    assignCourseToUser: async (userGuid: string, courseGuid: string) => {
        return await apiClient.post("/main/v1/organization/enrollments/bulk/", {
            user_guids: [userGuid],
            course_guids: [courseGuid],
        });
    },

    // Unenroll the currently authenticated user from a course
    unenrollCurrentUser: async (courseGuid: string) => {
        return await apiClient.delete(`/main/v1/unenroll/${courseGuid}/`);
    },

    // Unenroll one or more users from one or more courses (bulk)
    removeCourseFromUser: async (userGuids: string[], courseGuids: string[]) => {
        return await apiClient.delete(`/main/v1/organization/enrollments/bulk/`, {
            data: {
                user_guids: userGuids,
                course_guids: courseGuids,
            },
        });
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
