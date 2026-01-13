import * as Yup from "yup";

export const resetPasswordInitialValues = {
    email: "",
};

export const ResetPasswordSchema = Yup.object({
    email: Yup.string()
        .email("Enter a valid email address")
        .max(254, "Email must be 254 characters or less")
        .required("Email is required"),
});