import { Gender, UserStatus } from '@prisma/client';
import { z } from 'zod';

const createAdminValidationSchema = z.object({
  body: z.object({
    password: z.string({
      required_error: 'Password is required',
    }),
    admin: z.object({
      name: z.string({
        required_error: 'Name is required!',
      }),
      email: z.string({
        required_error: 'Email is required!',
      }),
      contactNumber: z.string({
        required_error: 'Contact Number is required!',
      }),
    }),
  }),
});

const createDoctorValidationSchema = z.object({
  body: z.object({
    password: z.string({
      required_error: 'Password is required',
    }),
    doctor: z.object({
      name: z.string({
        required_error: 'Name is required!',
      }),
      email: z.string({
        required_error: 'Email is required!',
      }),
      contactNumber: z.string({
        required_error: 'Contact Number is required!',
      }),
      address: z.string().optional(),
      registrationNumber: z.string({
        required_error: 'Reg number is required',
      }),
      experience: z.number().optional(),
      gender: z.enum([Gender.MALE, Gender.FEMALE]),
      appointmentFee: z.number({
        required_error: 'appointment fee is required',
      }),
      qualification: z.string({
        required_error: 'qualification is required',
      }),
      currentWorkingPlace: z.string({
        required_error: 'Current working place is required!',
      }),
      designation: z.string({
        required_error: 'Designation is required!',
      }),
    }),
  }),
});

const createPatientValidationSchema = z.object({
  body: z.object({
    password: z.string(),
    patient: z.object({
      email: z
        .string({
          required_error: 'Email is required!',
        })
        .email(),
      name: z.string({
        required_error: 'Name is required!',
      }),
      contactNumber: z.string({
        required_error: 'Contact number is required!',
      }),
      address: z.string({
        required_error: 'Address is required',
      }),
    }),
  }),
});

const changeUserStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum([
      UserStatus.ACTIVE,
      UserStatus.BLOCKED,
      UserStatus.DELETED,
    ]),
  }),
});

export const UserValidation = {
  createAdminValidationSchema,
  createDoctorValidationSchema,
  createPatientValidationSchema,
  changeUserStatusValidationSchema,
};
