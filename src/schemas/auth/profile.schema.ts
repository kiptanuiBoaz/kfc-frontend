import * as Yup from "yup";

export const ProfileSchema = Yup.object({
    first_name: Yup.string()
        .max(40, "First name must be 40 characters or less")
        .required("First name is required"),
    last_name: Yup.string()
        .max(40, "Last name must be 40 characters or less")
        .required("Last name is required"),
    bio: Yup.string()
        .max(500, "Bio must be 500 characters or less")
        .nullable()
        .optional(),
    phone_number: Yup.string()
        .max(20, "Phone number must be 20 characters or less")
        .nullable()
        .optional(),
});

export const profileInitialValues = {
    first_name: "",
    last_name: "",
    bio: "",
    phone_number: "",
};

export type ProfileFormValues = typeof profileInitialValues;
