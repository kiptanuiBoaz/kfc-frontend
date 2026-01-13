import { TCourseQuestion } from "@/types/course.types";

export interface TQuiz {
    guid: string;
    module_details: {
        guid: string;
        name: string;
        course_title: string;
    };
    name: string;
    description?: string | null;
    questions: TQuizQuestion[];
    question_count: number;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface TQuizQuestion {
    guid: string;
    quiz_details: {
        guid: string;
        name: string;
        module_name: string;
    };
    question_text: string;
    question_type: string;
    options: string[];
    correct_answer: string;
    marks: number;
    order: number;
    created_at: string;
    updated_at: string;
}

export interface TQuizDetails {
    guid: string;
    name: string;
    description?: string;
    questions: TQuizQuestion[];
}

export interface TQuizSubmission {
    user: {
        guid: string;
        name: string;
        email: string;
    };
    total_questions: number;
    answered_questions: number;
    correct_answers: number;
    score_percentage: number;
    submitted_at: string;
    has_feedback: boolean;
    feedback: {
        feedback: string;
        score: number | null;
        created_at: string;
    } | null;
}

export interface TQuizSubmissionsResponse {
    quiz: {
        guid: string;
        name: string;
        description: string;
        module_name: string;
        course_title: string;
        total_questions: number;
    };
    submissions: TQuizSubmission[];
}

export interface TQuizResults {
    quiz_name: string;
    total_questions: number;
    questions_answered: number;
    correct_answers: number;
    score_percentage: number;
    total_marks: number;
    possible_marks: number;
    completed: boolean;
    responses: TQuizResponse[];
}

export interface TQuizResponse {
    "guid": string,
    user_details: {
        "guid": string,
        "name": string,
        "email": string
    },
    question_details: {
        "guid": string,
        "question_text": string,
        "marks": number
    },
    "question_text": string,
    "selected_answer": string,
    "is_correct": boolean,
    "correct_answer": string,
    "answered_at": string,
    "created_at": string
}

export interface TQuizResponse {
    user: string;
    question: string;
    selected_answer: string;
}
