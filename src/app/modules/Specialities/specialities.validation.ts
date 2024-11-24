import { z } from 'zod';

const createSpecialitiesValidationSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Title is required!',
    }),
  }),
});

export const SpecialitiesValidation = {
  createSpecialitiesValidationSchema,
};
