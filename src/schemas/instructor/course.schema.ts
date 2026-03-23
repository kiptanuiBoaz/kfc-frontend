import * as Yup from 'yup';

export const CourseSchema = Yup.object().shape({
    title: Yup.string()
        .min(1, 'Title is required')
        .max(200, 'Title must be less than 200 characters')
        .required('Title is required'),
    category: Yup.string()
        .min(1, 'Category is required')
        .max(200, 'Category must be less than 200 characters')
        .required('Category is required'),
    description: Yup.string()
        .required('Description is required'),
    tags: Yup.array()
        .of(
            Yup.string()
                .min(1, 'Tag cannot be empty')
                .max(100, 'Tag must be less than 100 characters')
        )
        .min(1, 'At least one tag is required')
        .required('Tags are required'),
    expertise_level: Yup.string()
        .max(100, 'Expertise level must be less than 100 characters')
        .nullable(),
    prerequisites: Yup.array()
        .of(
            Yup.string()
                .min(1, 'Prerequisite cannot be empty')
                .max(100, 'Prerequisite must be less than 100 characters')
        )
        .required('Prerequisites are required'),
    objectives: Yup.array()
        .of(
            Yup.string()
                .min(1, 'Objective cannot be empty')
                .max(200, 'Objective must be less than 200 characters')
        )
        .min(1, 'At least one objective is required')
        .required('Objectives are required'),
    isPaid: Yup.boolean().required('Payment type is required'),
    amount: Yup.string()
        .nullable()
        .when('isPaid', {
            is: true,
            then: (schema) => schema.required('Amount is required for paid courses'),
            otherwise: (schema) => schema.nullable(),
        }),
    currency: Yup.string()
        .max(10, 'Currency must be less than 10 characters')
        .nullable()
        .when('isPaid', {
            is: true,
            then: (schema) => schema.required('Currency is required for paid courses'),
            otherwise: (schema) => schema.nullable(),
        }),
    isFeatured: Yup.boolean().required('Featured status is required'),
    status: Yup.string()
        .min(1, 'Status is required')
        .max(200, 'Status must be less than 200 characters')
        .required('Status is required'),
    instructor: Yup.string()
        .nullable()
        .required('Instructor is required'),
    learning_mode: Yup.string()
        .oneOf(['ONLINE', 'PHYSICAL'], 'Invalid learning mode')
        .required('Learning mode is required'),
    venue: Yup.string()
        .nullable()
        .when('learning_mode', {
            is: 'PHYSICAL',
            then: (schema) => schema.required('Venue is required for physical courses'),
            otherwise: (schema) => schema.nullable(),
        }),
    training_date: Yup.string()
        .nullable()
        .when('learning_mode', {
            is: 'PHYSICAL',
            then: (schema) => schema.required('Training date is required for physical courses'),
            otherwise: (schema) => schema.nullable(),
        }),
    // image: Yup.string()
    //     .url('Image must be a valid URL')
    //     .nullable(),
});

export const courseInitialValues = {
    title: '',
    description: '',
    tags: [] as string[],
    expertise_level: '',
    prerequisites: [] as string[],
    objectives: [] as string[],
    isPaid: false,
    amount: '',
    currency: 'USD',
    isFeatured: false,
    status: 'draft',
    instructor: "",
    learning_mode: 'ONLINE',
    venue: '',
    training_date: '',
    // image: '',
};



export const EXPERTISE_LEVELS = [
    'Beginner',
    'Intermediate',
    'Advanced',
    'Expert',
];

export const COURSE_STATUSES = [
    'draft',
    'active',
    'completed',
    'archived',
];

export const CURRENCIES = [
    'USD',

    'KES',

];



export const CourseInitialValues = {
    title: "",
    description: "",
    tags: [],
    expertise_level: "",
    prerequisites: [],
    objectives: [],
    isPaid: false,
    amount: "",
    currency: "KES",
    isFeatured: false,
    status: "draft",
    instructor: 1,
    learning_mode: 'ONLINE',
    venue: '',
    training_date: '',
    image: "",
}