import { categories } from './../lib/categories';
import { TQuiz } from "@/types/quiz.types";

export type TCourse = {
    title: string,
    description: string | null,
    tags: string[],
    expertise_level: TCourseExpertiseLevel,
    prerequisites: string[],
    objectives: string[],
    isPaid: boolean,
    amount: string | null,
    currency?: TCurrency,
    isFeatured: boolean,
    image?: string,
    status: string,
    category: string,
    instructor: number | null,
    total_duration?: string,
    course_progress?: number,
    instructor_name?: string,
    instructor_image?: string,
    modules?: TCourseModule[],
    created_by: string | null,
    updated_by: string | null,
    created_at?: string | null,
    updated_at?: string | null,
    deleted_at: string | null,
    deleted_by: string | null,
    id: number,
    guid: string,

};



export type TCourseStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'PUBLISHED';

export type TCourseExpertiseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export type TCurrency = 'USD' | 'KES';

export type TInstructorDetails = {
    guid: string;
    email: string;
    first_name: string;
    last_name: string;
    bio?: string | null;
    image?: string;
};

export type TModuleTopic = {
    id: number;
    guid: string;
    name: string;
    description: string;
    content?: string | null;
    duration?: string;
    order?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
    files?: string[];
    files_description?: string | null;
    videos?: string[];
    videos_description?: string | null;
    images?: string[];

};

export type TCourseModule = {
    id: number;
    guid: string;
    title?: string;
    name?: string;
    description?: string | null;
    duration_minutes?: number | null;
    order?: number | null;
    topics?: TModuleTopic[];
    quizzes?: TQuiz[];
    quiz_count?: number;
    topic_count?: number;
    module_progress?: number;
    course_details?: {
        guid: string;
        title: string;
        status: string;
    };
    created_at?: string | null;
    updated_at?: string | null;
};



export interface TCourseQuestion {
    guid?: string;
    quiz: string;
    question_text: string;
    question_type: string;
    options?: string[];
    correct_answer: string;
    marks: number;
    order: number;
    created_at?: string;
    updated_at?: string;
}



export interface TCoursePrviewDetails {
    id: number,
    guid: string,
    title: string,
    description: string,
    image: string,
    tags: string[],
    expertise_level: string,
    prerequisites: string[],
    category: string,
    objectives: string[],
    isPaid: boolean,
    amount: string | null,
    currency: string | null,
    isFeatured: boolean,
    status: string,
    instructor_details: {
        guid: string,
        email: string,
        first_name: string,
        last_name: string,
        bio: string | null,
        image: string
    },
    total_duration: string,
    course_progress: number,
    modules: TCourseModule[],
    created_at: string,
    created_by: string,
    updated_at: string,
    updated_by: string,
    deleted_at: null | string,
    deleted_by: null | string
}

export interface TCourseDiscussion {
    guid: string,
    course_details: {
        guid: string,
        title: string,
        status: string
    },
    user_details: {
        guid: string,
        name: string,
        email: string,
        image: string
    },
    comment: string,
    created_at: string,
    updated_at: string
}

export interface TEnrolledCourse {
    guid: string,
    title: string,
    description: string,
    category: string,
    image: string | null,
    status: string,
    enrolled_at: string,
    expertise_level: string,
    course_progress: number,
    instructor: {
        name: string
        email: string
    }
    tags?: string[],
    total_duration: string,

    isPaid: boolean,
    amount: string | null,
    currency: string | null,
}


