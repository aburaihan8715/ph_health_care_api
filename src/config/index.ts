import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
  JWT: {
    jwt_access_secret: process.env.JWT_ACCESS_SECRET,
    jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
    jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
    jwt_password_reset_secret: process.env.JWT_PASSWORD_RESET_SECRET,
    jwt_password_reset_expires_in:
      process.env.JWT_PASSWORD_RESET_EXPIRES_IN,
  },

  EMAIL_SENDER: {},
  SSL: {},
};
