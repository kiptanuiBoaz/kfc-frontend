import { TCourseModule } from "@/types/course.types";

export const sortModules = (modules: TCourseModule[]): TCourseModule[] => {
    // Create a shallow copy of modules to avoid mutating the original array
    const sortedModules = [...modules].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    // Sort topics inside each module by creating new arrays
    return sortedModules.map((m) => ({
        ...m,
        topics: m.topics && Array.isArray(m.topics) ? [...m.topics].sort((t1, t2) => (t1.order ?? 0) - (t2.order ?? 0)) : m.topics,
    }));
};