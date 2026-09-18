import axios from "axios";
import { OtpType } from "@/constants/common.const";

export const otpService = {
  /**
   * Sends an OTP to the specified email for the given type.
   */
  sendOtp: async (email: string, type: OtpType) => {
    const response = await axios.post("/api/auth/otp/send", { email, type });
    return response.data;
  },

  /**
   * Verifies the OTP provided by the user.
   */
  verifyOtp: async (email: string, code: string, type: OtpType) => {
    const response = await axios.post("/api/auth/otp/verify", { email, code, type });
    return response.data;
  }
};


