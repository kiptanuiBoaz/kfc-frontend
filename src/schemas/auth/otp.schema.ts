import * as Yup from 'yup';

export const OtpSchema = Yup.object().shape({
    otp: Yup.string()
        .required('OTP is required')
        .length(4, 'OTP must be 4 digits')
        .matches(/^[0-9]+$/, 'OTP must contain only numbers'),
});

export const otpInitialValues = {
    otp: '',
};

export type OtpFormValues = typeof otpInitialValues;