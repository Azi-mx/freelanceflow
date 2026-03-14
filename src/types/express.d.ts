import { UserRole } from "./enum";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: UserRole };
    }
  }
}

export {};
