

import * as Yup from 'yup';
export const ModuleTopicInitialValues = {
    name: '',
    description: '',
    duration: '',
    order: "",
};


export const ModuleTopicSchema = Yup.object().shape({
    name: Yup.string()
        .min(3, 'Topic name should have at least 3 characters')
        .max(150, 'Topic name must be under 150 characters')
        .required('Topic name is required'),
    description: Yup.string()
        .max(500, 'Topic description must be under 500 characters')
        .nullable(),
    duration: Yup.string()
        .matches(/^\d*$/, 'Duration must contain only numbers')
        .required(),
    order: Yup.number()
        .typeError('Topic order must be a number')
        .integer('Topic order must be a whole number')
        .min(1, 'Topic order must be at least 1')
        .required('Topic order is required'),
});
