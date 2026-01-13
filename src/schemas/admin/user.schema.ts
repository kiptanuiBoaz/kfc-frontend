import * as Yup from "yup";

export const UserSchema = Yup.object({
    first_name: Yup.string()
        .max(40, "First name must be 40 characters or less")
        .required("First name is required"),
    last_name: Yup.string()
        .max(40, "Last name must be 40 characters or less")
        .required("Last name is required"),
    email: Yup.string()
        .email("Enter a valid email address")
        .max(254, "Email must be 254 characters or less")
        .required("Email is required"),
    phone_number: Yup.string()
        .max(20, "Phone number must be 20 characters or less")
        .nullable()
        .optional(),
    // password: Yup.string()
    //     .min(8, "Password should be at least 8 characters")
    //     .max(300, "Password must be 300 characters or less")
    //     .when('$isEdit', {
    //         is: false,
    //         then: (schema) => schema.required("Password is required"),
    //         otherwise: (schema) => schema.optional(),
    //     }),
    confirmPassword: Yup.string()
        .when(['password', '$isEdit'], {
            is: (password: string, isEdit: boolean) => password && !isEdit,
            then: (schema) => schema
                .oneOf([Yup.ref("password"), null], "Passwords must match")
                .required("Please confirm your password"),
            otherwise: (schema) => schema.optional(),
        }),
    role: Yup.string()

        .required("Role is required"),
    is_active: Yup.boolean().required("Status is required"),
});

export const userInitialValues = {
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    // password: "",
    confirmPassword: "",
    role: null,
    is_active: true,
};