import * as Yup from "yup";

export const loginInitialValues = {
    email: "",
    password: "",
};

export const LoginSchema = Yup.object({
    email: Yup.string()
        .email("Enter a valid email address")
        .max(254, "Email must be 254 characters or less")
        .required("Email is required"),
    password: Yup.string()
        .min(8, "Password should be at least 8 characters")
        .max(300, "Password must be 300 characters or less")
        .required("Password is required"),
});
