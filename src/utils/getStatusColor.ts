import { TCourseStatus } from "@/types/course.types";

export const getStatusColor = (status: string) => {
    switch (status) {
        case "PUBLISHED":
            return "success";
        case "DRAFT":
            return "default";
        case "COMPLETED":
            return "info";

        default:
            return "default";
    }
};