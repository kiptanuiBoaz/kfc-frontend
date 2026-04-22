import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { TEnrolledCourse } from "@/types/course.types";
import { useIsAuthenticated } from "@/hooks/useAuth";

export const useMyCourses = () => {
    const isauthenticated = useIsAuthenticated();
    return useQuery<TEnrolledCourse[]>({
        queryKey: ["myCourses"],
        queryFn: async () => (await apiClient.get<TEnrolledCourse[]>("/main/v1/my-courses/")) ?? [],
        enabled: isauthenticated,
    });
};