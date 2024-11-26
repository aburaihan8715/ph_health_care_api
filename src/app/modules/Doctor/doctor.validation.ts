import { z } from 'zod';

const doctorUpdateValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    contactNumber: z.string().optional(),
  }),
});

export const DoctorValidation = {
  doctorUpdateValidationSchema,
};
