import * as z from 'zod';

export const userSchema = z.object({
  id: z.number(),
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name should have at least 2 alphabets')
    .refine(value => /^[a-zA-Z]+[-'s]?[a-zA-Z ]+$/.test(value), 'Name should contain only alphabets'),
  username: z
    .string({ required_error: 'Username is required' })
    .min(5, 'Username should have at least 5 character')
    .refine(value => /^[A-Za-z][A-Za-z0-9_]{4,29}$/.test(value), 'Username is invalid'),
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Email is invalid' })
    .refine(value => /^[\w-]{3,}@.*$/.test(value), 'name email ( before @ ) should have at least 3 character'),
  avatar_url: z.string(),
  bio: z.string(),
  website: z.string(),
  location: z.string(),
  posts_count: z.number(),
  dob: z.string().datetime(),
  created_at: z.date(),
  updated_at: z.date(),
});

const otherFieldsSchema = {
  password: z
    .string({ required_error: 'Password is required' })
    .refine(value => /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^.&*-]).{8,}$/.test(value),
      'Password must has at least 8 characters that include at least 1 lowercase character, 1 uppercase characters, 1 number, and 1 special character in (!@#$%^&*)'),
  confirmPassword: z.string({ required_error: 'Confirm password is required' }),
  dob: z.string({ required_error: 'Date of birth is required', invalid_type_error: 'Date of birth is required' }),
};

export const registerSchema = userSchema.pick({
  name: true,
  username: true,
  email: true,
}).merge(
  z.object({
    password: otherFieldsSchema.password,
    dob: otherFieldsSchema.dob,
  })
);

export const loginSchema = z.object({
  email: userSchema.shape.email,
  password: otherFieldsSchema.password,
});

export const resetPasswordSchema = z.object({
  password: otherFieldsSchema.password,
  confirmPassword: otherFieldsSchema.confirmPassword,
})
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        path: ['confirmPassword'],
        code: 'custom',
        message: 'Password and Confirm Password must be match',
      });
    }
  });
