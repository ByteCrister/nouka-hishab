import { OTP_TYPES } from "@/constants/common";

export const generateOtpHtml = (otp: string, type: string) => {
    let title = "Your Verification Code";
    let message = "Please use the following OTP to complete your process.";
    let preheader = "Your NoukaHishab verification code is here.";
    
    if (type === OTP_TYPES.EMAIL_VERIFICATION) {
        title = "Verify Your Email";
        message = "Please use the following code to verify your email address and complete your signup process.";
        preheader = "Your email verification code for NoukaHishab.";
    } else if (type === OTP_TYPES.USER_FORGOT_PASSWORD || type === OTP_TYPES.ADMIN_FORGOT_PASSWORD) {
        title = "Reset Your Password";
        message = "You recently requested to reset your password. Please use the following code to proceed. If you didn't request this, you can safely ignore this email.";
        preheader = "Your password reset code for NoukaHishab.";
    } else if (type === OTP_TYPES.USER_PASSWORD_CHANGE) {
        title = "Change Your Password";
        message = "Please use the following code to authorize changing your password.";
        preheader = "Your password change code for NoukaHishab.";
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <!--[if mso]>
    <noscript>
    <xml>
    <o:OfficeDocumentSettings>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
    </xml>
    </noscript>
    <![endif]-->
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Manrope:wght@400;500;600;700&display=swap');
        
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        
        body {
            margin: 0;
            padding: 0;
            width: 100% !important;
            background-color: #FBF8F2; /* sand-50 */
            font-family: 'Manrope', Arial, sans-serif;
            color: #10201B; /* ink-700 */
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #FFFFFF;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(16, 32, 27, 0.06);
        }
        
        .header {
            padding: 40px 20px 20px;
            text-align: center;
        }
        
        .header h1 {
            font-family: 'Fraunces', Georgia, serif;
            font-size: 26px;
            font-weight: 600;
            margin: 0;
            letter-spacing: -0.01em;
        }

        .content {
            padding: 20px 30px 40px;
            text-align: center;
        }

        .content h2 {
            font-family: 'Fraunces', Georgia, serif;
            font-size: 24px;
            color: #10201B; /* ink-700 */
            margin-top: 0;
            margin-bottom: 16px;
            font-weight: 600;
        }

        .content p {
            font-size: 16px;
            line-height: 1.6;
            color: #1B3229; /* ink-500 */
            margin: 0 0 32px 0;
        }

        .otp-box {
            background-color: #FBF8F2; /* sand-50 */
            border: 1px solid #E9DFC9; /* sand-200 */
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 32px;
        }

        .otp-code {
            font-family: 'Manrope', Courier, monospace;
            font-size: 36px;
            font-weight: 700;
            color: #0B5D3B; /* river-500 */
            letter-spacing: 8px;
            margin: 0;
        }

        .footer {
            padding: 30px;
            background-color: #F4EDE0; /* sand-100 */
            text-align: center;
            border-top: 1px solid #E9DFC9; /* sand-200 */
        }

        .footer p {
            font-size: 13px;
            color: #1B3229; /* ink-500 */
            line-height: 1.5;
            margin: 0 0 8px 0;
        }

        .footer p.last {
            margin-bottom: 0;
            color: #10201B;
            opacity: 0.6;
        }

        /* Mobile Responsive */
        @media screen and (max-width: 600px) {
            .container {
                border-radius: 0 !important;
                box-shadow: none !important;
            }
            .content {
                padding: 20px 20px 30px !important;
            }
            .header {
                padding: 30px 20px 10px !important;
            }
            .otp-code {
                font-size: 32px !important;
                letter-spacing: 6px !important;
            }
        }
    </style>
</head>
<body style="background-color: #FBF8F2; padding: 20px 0;">
    <!-- Preheader (Hidden but shown in email client previews) -->
    <div style="display: none; max-height: 0px; overflow: hidden; opacity: 0; font-size: 1px; line-height: 1px; color: #FBF8F2;">
        ${preheader}
    </div>

    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #FBF8F2;">
        <tr>
            <td align="center" style="padding: 20px;">
                <table class="container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #FFFFFF; max-width: 600px; margin: 0 auto;">
                    <!-- Header -->
                    <tr>
                        <td class="header">
                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto;">
                                <tr>
                                    <td align="center" valign="middle" style="padding-right: 10px;">
                                        <div style="background: linear-gradient(155deg, #12784B 0%, #0B5D3B 45%, #084229 100%); width: 32px; height: 32px; border-radius: 8px; text-align: center;">
                                            <img src="https://api.iconify.design/lucide:sailboat.svg?color=%23fbf8f2" width="20" height="20" alt="Logo" style="margin-top: 6px; display: inline-block;" />
                                        </div>
                                    </td>
                                    <td align="center" valign="middle">
                                        <h1><span style="color: #0B5D3B;">Nouka</span><span style="color: #C23B32;">Hishab</span></h1>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td class="content">
                            <h2>${title}</h2>
                            <p>${message}</p>
                            
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td align="center">
                                        <div class="otp-box" style="display: inline-block; width: auto;">
                                            <p class="otp-code">${otp}</p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="font-size: 14px; margin-bottom: 0;">This code will expire in <strong>10 minutes</strong>. Please do not share this code with anyone.</p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td class="footer">
                            <p>You received this email because it was associated with an action on NoukaHishab.</p>
                            <p class="last">&copy; ${new Date().getFullYear()} NoukaHishab. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
};
