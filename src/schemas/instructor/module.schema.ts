import * as Yup from 'yup';

const optionalDurationField = Yup.number()
    .typeError('Duration must be a valid number of minutes')
    .integer('Duration must be a whole number of minutes')
    .min(1, 'Duration should be at least 1 minute')
    .nullable()
    .transform((value, originalValue) => {
        if (originalValue === '' || originalValue === null || originalValue === undefined) {
            return null;
        }
        return value;
    });

export const ModuleInitialValues = {
    name: '',
    description: '',
    order: 1,
};

export type ModuleFormValues = typeof ModuleInitialValues;

export const CourseModuleSchema = Yup.object().shape({
    name: Yup.string()
        .min(3, 'Module name should have at least 3 characters')
        .max(150, 'Module name must be under 150 characters')
        .required('Module name is required'),
    description: Yup.string()
        .max(500, 'Module description must be under 500 characters')
        .nullable(),
    order: Yup.number()
        .typeError('Module order must be a number')
        .integer('Module order must be a whole number')
        .min(1, 'Module order must be at least 1')
        .required('Module order is required'),
});

