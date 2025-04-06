/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import bcrypt from 'bcrypt';

import { UserStatus } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { ILogin } from './auth.constant';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import { Secret, SignOptions } from 'jsonwebtoken';
import config from '../../../config';
import emailSender from './emailSender';
import ApiError from '../../errors/ApiError';

// LOGIN
const loginUser = async (payload: ILogin) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    userData.password,
  );

  if (!isCorrectPassword) {
    throw new Error('Wrong credentials!');
  }
  const accessToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.JWT_ACCESS_SECRET as Secret,
    config.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.JWT_REFRESH_SECRET as Secret,
    config.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

// REFRESH TOKEN
const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = jwtHelpers.verifyToken(
      token,
      config.JWT_REFRESH_SECRET as Secret,
    );
  } catch (err) {
    throw new Error('You are not authorized!');
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });

  const accessToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.JWT_ACCESS_SECRET as Secret,
    config.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
  );

  return {
    accessToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

// CHANGE PASSWORD
const changePassword = async (user: any, payload: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.oldPassword,
    userData.password,
  );

  if (!isCorrectPassword) {
    throw new Error('Password incorrect!');
  }

  const hashedPassword: string = await bcrypt.hash(
    payload.newPassword,
    10,
  );

  await prisma.user.update({
    where: {
      email: userData.email,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });

  return {
    message: 'Password changed successfully!',
  };
};

// FORGET PASSWORD
const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const resetPassToken = jwtHelpers.generateToken(
    { email: userData.email, role: userData.role },
    config.JWT_PASSWORD_RESET_SECRET as Secret,
    config.JWT_PASSWORD_RESET_EXPIRES_IN as SignOptions['expiresIn'],
  );

  //console.log(resetPassToken)

  const passwordResetUILink = `${config.PASSWORD_RESET_UI_LINK}?userId=${userData.id}&token=${resetPassToken}`;

  // const html = `
  //     <div>
  //         <p>Dear User,</p>
  //         <p>Your password reset link
  //             <a href=${passwordResetUILink}>
  //                 <button>
  //                     Reset Password
  //                 </button>
  //             </a>
  //         </p>
  //     </div>
  //     `;

  const html = `
  <!doctype html>
  <html>
    <head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Password reset</title>
    <style>
      img {
        border: none;
        -ms-interpolation-mode: bicubic;
        max-width: 100%;
      }
      body {
        background-color: #f6f6f6;
        font-family: sans-serif;
        -webkit-font-smoothing: antialiased;
        font-size: 14px;
        line-height: 1.4;
        margin: 0;
        padding: 0;
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
      }
      table {
        border-collapse: separate;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
        width: 100%;
      }
      table td {
        font-family: sans-serif;
        font-size: 14px;
        vertical-align: top;
      }
      .body {
        background-color: #f6f6f6;
        width: 100%;
      }
      .container {
        display: block;
        margin: 0 auto !important;
        /* makes it centered */
        max-width: 580px;
        padding: 10px;
        width: 580px;
      }
      .content {
        box-sizing: border-box;
        display: block;
        margin: 0 auto;
        max-width: 580px;
        padding: 10px;
      }
      .main {
        background: #ffffff;
        border-radius: 3px;
        width: 100%;
      }
      .wrapper {
        box-sizing: border-box;
        padding: 20px;
      }
      .content-block {
        padding-bottom: 10px;
        padding-top: 10px;
      }
      .footer {
        clear: both;
        margin-top: 10px;
        text-align: center;
        width: 100%;
      }
      .footer td,
      .footer p,
      .footer span,
      .footer a {
        color: #999999;
        font-size: 12px;
        text-align: center;
      }
      h1,
      h2,
      h3,
      h4 {
        color: #000000;
        font-family: sans-serif;
        font-weight: 400;
        line-height: 1.4;
        margin: 0;
        margin-bottom: 30px;
      }
      h1 {
        font-size: 35px;
        font-weight: 300;
        text-align: center;
        text-transform: capitalize;
      }
      p,
      ul,
      ol {
        font-family: sans-serif;
        font-size: 14px;
        font-weight: normal;
        margin: 0;
        margin-bottom: 15px;
      }
      p li,
      ul li,
      ol li {
        list-style-position: inside;
        margin-left: 5px;
      }
      a {
        color: #55c57a;
        text-decoration: underline;
      }
      .btn {
        box-sizing: border-box;
        width: 100%;
      }
      .btn > tbody > tr > td {
        padding-bottom: 15px;
      }
      .btn table {
        width: auto;
      }
      .btn table td {
        background-color: #ffffff;
        border-radius: 5px;
        text-align: center;
      }
      .btn a {
        background-color: #ffffff;
        border: solid 1px #55c57a;
        border-radius: 5px;
        box-sizing: border-box;
        color: #55c57a;
        cursor: pointer;
        display: inline-block;
        font-size: 14px;
        font-weight: bold;
        margin: 0;
        padding: 12px 25px;
        text-decoration: none;
        text-transform: capitalize;
      }
      .btn-primary table td {
        background-color: #55c57a;
      }
      .btn-primary a {
        background-color: #55c57a;
        border-color: #55c57a;
        color: #ffffff;
      }
      .last {
        margin-bottom: 0;
      }
      .first {
        margin-top: 0;
      }
      .align-center {
        text-align: center;
      }
      .align-right {
        text-align: right;
      }
      .align-left {
        text-align: left;
      }
      .clear {
        clear: both;
      }
      .mt0 {
        margin-top: 0;
      }
      .mb0 {
        margin-bottom: 0;
      }
      .preheader {
        color: transparent;
        display: none;
        height: 0;
        max-height: 0;
        max-width: 0;
        opacity: 0;
        overflow: hidden;
        mso-hide: all;
        visibility: hidden;
        width: 0;
      }
      .powered-by a {
        text-decoration: none;
      }
      hr {
        border: 0;
        border-bottom: 1px solid #f6f6f6;
        margin: 20px 0;
      }
      @media only screen and (max-width: 620px) {
        table[class='body'] h1 {
          font-size: 28px !important;
          margin-bottom: 10px !important;
        }
        table[class='body'] p,
        table[class='body'] ul,
        table[class='body'] ol,
        table[class='body'] td,
        table[class='body'] span,
        table[class='body'] a {
          font-size: 16px !important;
        }
        table[class='body'] .wrapper,
        table[class='body'] .article {
          padding: 10px !important;
        }
        table[class='body'] .content {
          padding: 0 !important;
        }
        table[class='body'] .container {
          padding: 0 !important;
          width: 100% !important;
        }
        table[class='body'] .main {
          border-left-width: 0 !important;
          border-radius: 0 !important;
          border-right-width: 0 !important;
        }
        table[class='body'] .btn table {
          width: 100% !important;
        }
        table[class='body'] .btn a {
          width: 100% !important;
        }
        table[class='body'] .img-responsive {
          height: auto !important;
          max-width: 100% !important;
          width: auto !important;
        }
      }
      @media all {
        .ExternalClass {
          width: 100%;
        }
        .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
          line-height: 100%;
        }
        .apple-link a {
          color: inherit !important;
          font-family: inherit !important;
          font-size: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
          text-decoration: none !important;
        }
        .btn-primary table td:hover {
          background-color: #2e864b !important;
        }
        .btn-primary a:hover {
          background-color: #2e864b !important;
          border-color: #2e864b !important;
        }
      }
    </style>
  </head>
  <body>
    <table
      class="body"
      role="presentation"
      border="0"
      cellpadding="0"
      cellspacing="0"
    >
      <tbody>
        <tr>
          <td></td>
          <td class="container">
            <div class="content">
              <!-- START CENTERED WHITE CONTAINER-->
              <table class="main" role="presentation">
                <!-- START MAIN AREA-->
                <tbody>
                  <tr>
                    <td class="wrapper">
                      <table
                        role="presentation"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                      >
                        <tbody>
                          <tr>
                            <td>
                              <!-- CONTENT-->
                              <p>Hi {{NAME}},</p>
                              <p>
                                Welcome to (Name of project), we're glad to
                                have you 🎉🙏
                              </p>
                              <p>
                                Please reset your password with in 10
                                minutes
                              </p>
                              <table
                                class="btn btn-primary"
                                role="presentation"
                                border="0"
                                cellpadding="0"
                                cellspacing="0"
                              >
                                <tbody>
                                  <tr>
                                    <td align="left">
                                      <table
                                        role="presentation"
                                        border="0"
                                        cellpadding="0"
                                        cellspacing="0"
                                      >
                                        <tbody>
                                          <tr>
                                            <td>
                                               <a href=${passwordResetUILink}
                                                target="_blank"
                                                >Reset Password</a
                                              >
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <p>
                                If you need any help, please don't hesitate
                                to contact me!
                              </p>
                              <p>- Abu Raihan, CEO</p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <!-- START FOOTER-->
              <div class="footer">
                <table
                  role="presentation"
                  border="0"
                  cellpadding="0"
                  cellspacing="0"
                >
                  <tbody>
                    <tr>
                      <td class="content-block">
                        <span class="apple-link"
                          >XYZ Inc, 123 Banani Road, Dhaka Bangladesh</span
                        ><br />
                        Don't like these emails?
                        <a href="#">Unsubscribe</a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
  `;

  await emailSender(userData.email, html);
  //console.log(resetPassLink)
};

// RESET PASSWORD
const resetPassword = async (
  token: string,
  payload: { id: string; password: string },
) => {
  await prisma.user.findUniqueOrThrow({
    where: {
      id: payload.id,
      status: UserStatus.ACTIVE,
    },
  });

  const isValidToken = jwtHelpers.verifyToken(
    token,
    config.JWT_PASSWORD_RESET_SECRET as Secret,
  );

  if (!isValidToken) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Token is not valid!');
  }

  // hash password
  const hashPassword = await bcrypt.hash(payload.password, 10);

  // update into database
  await prisma.user.update({
    where: {
      id: payload.id,
    },
    data: {
      password: hashPassword,
    },
  });
};

export const AuthService = {
  loginUser,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
};
