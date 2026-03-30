import bcrypt from "bcryptjs";
import { REFRESH_TOKEN_HASH_ROUNDS } from "../config/constants.js";
export const hashToken = async (token: string): Promise<string> => {
  return await bcrypt.hash(token, REFRESH_TOKEN_HASH_ROUNDS);
};
