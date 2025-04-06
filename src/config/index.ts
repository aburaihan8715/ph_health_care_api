import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
  JWT_PASSWORD_RESET_SECRET: process.env.JWT_PASSWORD_RESET_SECRET,
  JWT_PASSWORD_RESET_EXPIRES_IN: process.env.JWT_PASSWORD_RESET_EXPIRES_IN,

  PASSWORD_RESET_UI_LINK: process.env.PASSWORD_RESET_UI_LINK,
  SALT_ROUND: process.env.SALT_ROUND,

  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
};

/*
http://localhost:3000/reset-password?userId=a5093701-d4ca-4f01-8c21-d671ba5c9e9d&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFidXJhaWhhbjg3MjFAZ21haWwuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzQzNzY3NDg3LCJleHAiOjE3NDM3NjgwODd9.VopRvg_209G7VlIZ8j45kXbSsNY1uB1LoOL4ytOpN2A
*/
