import { z } from 'zod';
export const PASSWORD_POLICY = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumeric: true,
  requireNonAlphanumeric: true,
  maxLength: 50,
};

const passswordMaxLengthMessage = `Password must be at most ${PASSWORD_POLICY.maxLength} characters long.`;
const passwordMinLengthMessage = `Password must be at least ${PASSWORD_POLICY.minLength} characters long.`;
const passwordUppercaseMessage =
  'Password must contain at least one uppercase letter.';
const passwordLowercaseMessage =
  'Password must contain at least one lowercase letter.';
const passwordNumericMessage = 'Password must contain at least one number.';
const passwordNonAlphanumericMessage =
  'Password must contain at least one special character (e.g., !@#$%^&*).';

export const passwordSchema = z
  .string()
  .min(PASSWORD_POLICY.minLength, { message: passwordMinLengthMessage })
  .max(PASSWORD_POLICY.maxLength, { message: passswordMaxLengthMessage })
  .refine((val) => !PASSWORD_POLICY.requireUppercase || /[A-Z]/.test(val), {
    message: passwordUppercaseMessage,
  })
  .refine((val) => !PASSWORD_POLICY.requireLowercase || /[a-z]/.test(val), {
    message: passwordLowercaseMessage,
  })
  .refine((val) => !PASSWORD_POLICY.requireNumeric || /[0-9]/.test(val), {
    message: passwordNumericMessage,
  })
  .refine(
    (val) =>
      !PASSWORD_POLICY.requireNonAlphanumeric || /[^a-zA-Z0-9]/.test(val),
    { message: passwordNonAlphanumericMessage }
  );

export const signUpSchema = z
  .object({
    email: z.string().email('Invalid email address format.'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format.'),
  password: z.string().min(1, 'Password is required.'),
});

export type LoginInput = z.infer<typeof loginSchema>;
