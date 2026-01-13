import { TEnrolledCourse } from "@/types/course.types";

export const isCourseEnrolled = (courses: TEnrolledCourse[], courseGuid: string): boolean => {
    return courses.some(course => course.guid === courseGuid);
};