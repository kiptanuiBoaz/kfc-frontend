import * as Yup from "yup";

export const SignUpSchema =
    Yup.object({
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
        password: Yup.string()
            .min(8, "Password should be at least 8 characters")
            .max(300, "Password must be 300 characters or less")
            .required("Password is required"),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref("password"), null], "Passwords must match")
            .required("Please confirm your password"),
    });


export const signupInitialValues = {
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
    is_active: true,
    is_first_time_login: true,
    // role: "USER",
}
