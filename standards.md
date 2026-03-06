# FreelanceFlow — Project Standards & Code Guidelines

> These rules apply to every line of code written in this project.
> No exceptions. No shortcuts.

---

## 1. Project Structure

```
src/
├── config/         # DB, env, redis, third-party setup
├── controllers/    # Request handlers only — no business logic
├── services/       # All business logic lives here
├── models/         # Mongoose schemas and interfaces
├── routes/         # Route definitions and middleware chains
├── middlewares/    # Auth, roles, validation, error handling
├── validations/    # Zod schemas for every request
├── utils/          # Pure helper functions
├── jobs/           # BullMQ workers and queue definitions
└── index.ts        # App bootstrap only
```

**Rules:**

- Never create files outside this structure without a clear reason
- One responsibility per file — if a file is doing two things, split it
- No `index.ts` barrel files inside feature folders — import directly

---

## 2. Naming Conventions

| Thing               | Convention                 | Example                         |
| ------------------- | -------------------------- | ------------------------------- |
| Files               | camelCase                  | `authService.ts`                |
| Interfaces          | PascalCase with `I` prefix | `IUser`, `IProject`             |
| Enums               | PascalCase                 | `UserRole`, `BidStatus`         |
| Constants           | SCREAMING_SNAKE_CASE       | `MAX_BID_AMOUNT`                |
| Functions           | camelCase, verb-first      | `createUser`, `findProjectById` |
| Variables           | camelCase                  | `accessToken`, `hashedPassword` |
| MongoDB collections | PascalCase singular        | `User`, `Project`, `Bid`        |
| Routes              | kebab-case, plural nouns   | `/api/projects`, `/api/bids`    |
| Env variables       | SCREAMING_SNAKE_CASE       | `JWT_ACCESS_SECRET`             |

---

## 3. TypeScript Rules

```typescript
// ✅ Always type function parameters and return types
const createUser = async (data: ICreateUserInput): Promise<IUser> => {};

// ✅ Use interfaces for objects, types for unions/primitives
interface ICreateUserInput {
  name: string;
  email: string;
}
type UserRole = "client" | "freelancer";

// ✅ Use enums for fixed sets of values
enum BidStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

// ✅ Never use `any` — use `unknown` if type is truly unknown
const parseData = (input: unknown): IUser => {};

// ❌ Never do this
const user: any = await User.findById(id);
const data = req.body; // untyped body

// ✅ Always type req.body
interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
const { name, email } = req.body as RegisterRequest;
```

**Strict Rules:**

- `strict: true` is non-negotiable — never disable it
- No `@ts-ignore` comments — fix the type error properly
- No implicit `any` — always be explicit

---

## 4. Controller Rules

Controllers do exactly 3 things: **receive, delegate, respond.**

```typescript
// ✅ Correct controller
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error); // Always pass errors to error handler
  }
};

// ❌ Wrong — business logic in controller
export const register = async (req: Request, res: Response) => {
  const existing = await User.findOne({ email: req.body.email }); // WRONG
  const hashed = await bcrypt.hash(req.body.password, 12); // WRONG
  const user = await User.create({ ...req.body, password: hashed }); // WRONG
  res.json(user);
};
```

**Rules:**

- Controllers never import Mongoose models directly
- Controllers never contain if/else business logic
- Controllers always call `next(error)` — never `res.json` an error manually
- Maximum 10 lines per controller function

---

## 5. Service Rules

Services contain all business logic. They are framework-agnostic — no `req`, no `res`.

```typescript
// ✅ Correct service
export const register = async (data: IRegisterInput): Promise<IAuthResult> => {
  const existing = await User.findOne({ email: data.email });
  if (existing) throw new AppError("Email already in use", 409);

  const user = await User.create(data);
  const accessToken = generateAccessToken(user._id);
  return { user, accessToken };
};
```

**Rules:**

- Services never import `req` or `res` from Express
- Services throw typed errors — never return error objects
- One service file per domain: `authService.ts`, `projectService.ts`, `bidService.ts`

---

## 6. Error Handling

All errors flow through a single global error handler. Never handle errors inline.

```typescript
// src/utils/AppError.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public isOperational: boolean = true,
  ) {
    super(message);
  }
}

// Usage in services
throw new AppError("User not found", 404);
throw new AppError("Email already in use", 409);
throw new AppError("Invalid credentials", 401);
```

**Rules:**

- Never `res.json({ error: ... })` directly — always `next(error)`
- Never swallow errors with empty catch blocks
- Always use `AppError` for known errors
- Unknown errors (DB failures, etc.) are caught by the global handler

---

## 7. Validation Rules

Every request body is validated before it hits the controller. No exceptions.

```typescript
// ✅ Zod schema in src/validations/authValidation.ts
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["client", "freelancer"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;
```

**Rules:**

- Every POST/PUT route has a validation schema
- Validation middleware runs before the controller
- Never access `req.body` without validating it first
- Use `zod` — it integrates with TypeScript natively

---

## 8. API Response Format

Every API response follows this exact structure:

```typescript
// Success
{
  "success": true,
  "message": "User registered successfully",
  "data": { ... }
}

// Error
{
  "success": false,
  "message": "Email already in use",
  "statusCode": 409
}

// Paginated list
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

**Rules:**

- Never return raw Mongoose documents — always shape the response
- Never expose `password`, `refreshToken`, or `__v` fields
- Always include `success: boolean` in every response

---

## 9. Database Rules

```typescript
// ✅ Always select only needed fields
const user = await User.findById(id).select('name email role avatar');

// ✅ Use lean() for read-only queries — returns plain JS object, faster
const projects = await Project.find().lean();

// ✅ Always add indexes to fields you query/filter by
email: { type: String, unique: true, index: true }

// ❌ Never do this
const all = await User.find(); // fetches everything including passwords
```

**Rules:**

- `password` and `refreshToken` have `select: false` — never override this
- Use `.lean()` on read-only queries for performance
- Every foreign key reference uses `mongoose.Schema.Types.ObjectId` with `ref`
- All schemas use `timestamps: true`
- Add indexes for any field used in `.find()`, `.filter()`, or `.sort()`

---

## 10. Security Rules

- Never store plain-text passwords — bcrypt with salt rounds ≥ 12
- Refresh tokens live in `httpOnly` cookies only — never in response body
- Access tokens live in memory/app state on frontend — never in localStorage
- All routes are protected by `authMiddleware` unless explicitly public
- Rate limiting on all auth routes
- `helmet()` applied globally
- `cors` configured with explicit origin — never `*` in production
- Never log sensitive data (passwords, tokens, card numbers)
- Always validate and sanitize user input before DB operations

---

## 11. Git Rules

**Branch naming:**

```
feature/user-auth
feature/project-posting
fix/bid-validation-bug
chore/setup-docker
```

**Commit message format (Conventional Commits):**

```
feat: add user registration endpoint
fix: resolve refresh token expiry issue
chore: setup eslint and prettier
docs: add API documentation for auth routes
refactor: move business logic from controller to service
test: add unit tests for auth service
```

**Rules:**

- Never commit directly to `main`
- One feature per branch
- Commit after every completed task from the roadmap
- Never commit `.env` files — ever

---

## 12. Environment Config Rules

```typescript
// ✅ Always use typed config
import { config } from "../config/env.js";
const secret = config.jwt.accessSecret;

// ❌ Never access process.env directly outside config/env.ts
const secret = process.env.JWT_ACCESS_SECRET; // WRONG
```

**Rules:**

- All env variables are defined in `src/config/env.ts`
- App crashes on startup if required env vars are missing (fail fast)
- `.env` is in `.gitignore` — always
- `.env.example` is committed with all keys but no values

---

## 13. File Length Limits

- No file can exceed the limit of 475 lines.
- If possible seperate files for different functions
  **Rules:**
- A file approaching its limit is a signal it has too many responsibilities
- Split early — merging is easier than untangling
- Line count includes comments and whitespace

---

## 14. File Header Standard

Every file starts with a one-line comment explaining its purpose:

```typescript
// Handles all authentication business logic: register, login, token refresh
```

---

## 15. What We Never Do

| Never                            | Why                                |
| -------------------------------- | ---------------------------------- |
| Business logic in controllers    | Untestable, unmaintainable         |
| Raw `process.env` outside config | No type safety, scattered config   |
| `any` type                       | Defeats the purpose of TypeScript  |
| Returning passwords in responses | Security vulnerability             |
| Storing tokens in localStorage   | XSS vulnerability                  |
| Empty catch blocks               | Silently swallows errors           |
| Direct DB queries in controllers | Bypasses service layer             |
| `console.log` in production code | Use a proper logger (Winston)      |
| Skipping input validation        | Injection attacks, data corruption |
| Committing `.env`                | Credential exposure                |

## 16. Documentation Rules

- Every function in services must have a JSDoc comment
- Example:

/\*\*

- Registers a new user and returns tokens
- @param data - validated register input
- @param res - express response (for setting cookie)
- @returns accessToken and user object
  \*/

* Every route must be documented with Swagger in Phase 8
* README must be updated when new features are added
