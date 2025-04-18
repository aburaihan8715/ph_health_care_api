import express from 'express';
import { UserRoutes } from '../modules/User/user.route';
import { AdminRoutes } from '../modules/Admin/admin.route';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { SpecialitiesRoutes } from '../modules/Specialities/specialities.route';
import { DoctorRoutes } from '../modules/Doctor/doctor.route';
import { PatientRoutes } from '../modules/Patient/patient.route';
import { ScheduleRoutes } from '../modules/Schedule/schedule.route';
import { DoctorScheduleRoutes } from '../modules/DoctorSchedule/doctorSchedule.route';
import { AppointmentRoutes } from '../modules/Appointment/appointment.route';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/admins',
    route: AdminRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/specialities',
    route: SpecialitiesRoutes,
  },
  {
    path: '/doctors',
    route: DoctorRoutes,
  },
  {
    path: '/patients',
    route: PatientRoutes,
  },
  {
    path: '/schedules',
    route: ScheduleRoutes,
  },
  {
    path: '/doctor-schedules',
    route: DoctorScheduleRoutes,
  },
  {
    path: '/appointments',
    route: AppointmentRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
