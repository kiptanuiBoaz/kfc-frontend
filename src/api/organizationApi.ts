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

    getOrganizationEnrollments: async (orgGuid?: string) => {
        // Preferred approach: aggregate enrollments by querying each course's enrollments endpoint.
        try {
            const courses = await apiClient.get<TCoursePrviewDetails[]>('/main/v1/courses/');
            if (Array.isArray(courses) && courses.length > 0) {
                const enrollments: any[] = [];
                for (const course of courses) {
                    try {
                        const courseResp = await apiClient.get<any>(`/main/v1/courses/${course.guid}/enrollments/`);
                        const courseEnrollments = Array.isArray(courseResp) ? courseResp : (courseResp && (courseResp.data || courseResp.results || courseResp.enrollments)) || [];
                        if (!Array.isArray(courseEnrollments) || courseEnrollments.length === 0) continue;

                        for (const e of courseEnrollments) {
                            const user = e.user || e.user_details || e.user_info || {};
                            const userGuid = e.user_guid || user.guid || e.user?.guid || '';
                            const userEmail = e.email || user.email || e.email_address || user.email_address || '';
                            const userName =
                                e.name ||
                                e.user_name ||
                                `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
                                user.name ||
                                'Unknown';

                            enrollments.push({
                                userGuid,
                                userName,
                                userEmail,
                                courseGuid: course.guid,
                                courseTitle: course.title,
                                enrolledAt: e.enrolled_at || e.created_at || e.timestamp || new Date().toISOString(),
                                status: e.status || e.enrollment_status || 'Active',
                            });
                        }
                    } catch (innerErr) {
                        console.warn(`Failed to fetch enrollments for course ${course.guid}:`, innerErr);
                    }
                }

                if (enrollments.length > 0) return enrollments;
            }
        } catch (err) {
            // No per-course enrollments available or courses list failed. Return empty.
        }

        return [];

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
                        const courseResp = await apiClient.get<any>(`/main/v1/courses/${c.guid}/enrollments/`);
                        const enrollments: any[] | undefined = Array.isArray(courseResp) ? courseResp : (courseResp && (courseResp.data || courseResp.results || courseResp.enrollments)) || [];
                        if (Array.isArray(enrollments) && enrollments.length > 0) {
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
        try {
            return await apiClient.post("/main/v1/organization/enrollments/bulk/remove/", {
                user_guids: userGuids,
                course_guids: courseGuids,
            });
        } catch (error: any) {
            const status = error?.response?.status;
            const detail = error?.response?.data?.detail || "";

            // If the remove path doesn't exist, retry against the known bulk enroll endpoint
            // with a removal action payload. This matches the only registered organizaton bulk route.
            if (status === 404 || detail.includes("not match any of these")) {
                return await apiClient.post("/main/v1/organization/enrollments/bulk/", {
                    user_guids: userGuids,
                    course_guids: courseGuids,
                    action: "remove",
                });
            }

            // If the backend still requires delete changes, fallback to the bulk delete attempt.
            if (status === 405 || detail.includes("Method \"DELETE\" not allowed")) {
                return await apiClient.delete("/main/v1/organization/enrollments/bulk/", {
                    data: {
                        user_guids: userGuids,
                        course_guids: courseGuids,
                    },
                });
            }

            throw error;
        }
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
