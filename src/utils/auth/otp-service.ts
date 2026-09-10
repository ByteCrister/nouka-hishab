import axios from "axios";

export const otpService = {
  /**
   * Sends an OTP to the specified email for the given type.
   */
  sendOtp: async (email: string, type: 'email_verification' | 'user_forgot_password' | 'admin_forgot_password' | 'user_password_change') => {
    const response = await axios.post("/api/auth/otp/send", { email, type });
    return response.data;
  },

  /**
   * Verifies the OTP provided by the user.
   */
  verifyOtp: async (email: string, code: string, type: 'email_verification' | 'user_forgot_password' | 'admin_forgot_password' | 'user_password_change') => {
    const response = await axios.post("/api/auth/otp/verify", { email, code, type });
    return response.data;
  }
};
