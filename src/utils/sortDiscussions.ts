import { TCourseDiscussion } from "@/types/course.types";
import dayjs from "dayjs";

export const sortedDiscussions = (discussions: TCourseDiscussion[]) => {
    return discussions.sort((a, b) => {
        const dateA = dayjs(a.created_at);
        const dateB = dayjs(b.created_at);
        return dateB.diff(dateA);
    });
}

