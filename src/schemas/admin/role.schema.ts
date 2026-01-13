import * as yup from "yup";

export const roleInitialValues = {
    name: "",
    description: "",
    permission_id: [],
};

export const RoleSchema = yup.object().shape({
    name: yup
        .string()
        .required("Role name is required")
        .min(2, "Role name must be at least 2 characters")
        .max(50, "Role name must be less than 50 characters"),
    description: yup
        .string()
        .required("Description is required")
        .min(5, "Description must be at least 5 characters")
        .max(200, "Description must be less than 200 characters"),
    // permission_id: yup
    //     .array()
    //     .of(yup.string())
    //     .min(1, "At least one permission is required"),
});