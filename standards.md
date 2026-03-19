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

## 17. GitHub Standards

### Branch Strategy

main → stable, production-ready code only. Never commit directly.
develop → integration branch. Merge features here first.
feature/xxx → new features. Branch from develop.
fix/xxx → bug fixes. Branch from develop.
chore/xxx → setup, config, tooling changes.

### Flow

develop → feature/auth → finish → PR into develop → merge → PR into main

### PR Rules

- Every PR must have a clear title and description
- No PR merges without working code
- One feature per PR — never mix features

### Commit Message Format (Conventional Commits)

feat: add user registration endpoint
fix: resolve refresh token typo in logout
chore: setup eslint and prettier
refactor: move token logic to generateTokens utility
test: add unit tests for authService

### Rules

- Never commit directly to main
- Never commit .env files
- Commit after every completed task
- Keep commits small and focused
- Write commit messages in present tense

## 18. Testing Standards

### Right Now — Manual Testing

- Every API endpoint tested in Postman before moving forward
- Save all requests in a Postman collection
- Test happy path AND error cases

### Phase 1 Complete — Unit Tests (Jest)

- Every service function has a unit test
- Test happy path, error cases, edge cases

### Phase 3+ — Integration Tests (Supertest)

- Test full request/response cycle
- Test middleware, validation, auth

### Frontend — E2E Tests (Cypress)

- Test critical user flows only
- Register, login, post project, submit bid

## 15. Scalability & Future-Proofing Rules

Every design decision must answer this question:
**"If requirements change tomorrow, how much do I need to rewrite?"**

The answer should always be — **as little as possible.**

### Rules

- **Design for extension, not modification** — adding new features should not require rewriting existing code
- **Use rest parameters for roles** — never hardcode a single role when a route might support multiple in future
- **Use enums for all fixed values** — adding a new status/role/type is one line change in enums.ts
- **Never hardcode strings** — use constants and enums so changes happen in one place
- **Build middleware to be composable** — `authMiddleware, roleMiddleware("client", "admin")` not one giant middleware
- **Config over code** — behavior that might change goes in config, not hardcoded in logic

### Examples

```typescript
// ❌ Not scalable
roleMiddleware("client");

// ✅ Scalable
roleMiddleware("client", "admin");

// ❌ Not scalable
if (status === "active" || status === "pending") {
}

// ✅ Scalable
if ([ContractStatus.ACTIVE, ContractStatus.PENDING].includes(status)) {
}
```

### The Rule In One Line

> **Every function, middleware, and config should be open for extension but closed for modification.**

This is the **Open/Closed Principle** — one of the most important rules in software engineering.

---

## 19. Docker Best Practices

1. Use a `.dockerignore` file — exclude `.git`, `node_modules`, secrets
2. Clean up in the same layer — `apt-get install && rm -rf /var/lib/apt/lists/*` in one RUN
3. Never use `ENV` for secrets — use `ARG` for build-time, volume mounts for runtime
4. Run as non-root user — create `appuser`, switch with `USER` instruction
5. Optimize cache ordering — copy `package.json` first, run `npm ci`, then copy source code
6. Pin versions — use `node:20-alpine` not `node:latest`
7. Use minimal base images — `alpine`, `distroless`, or `-slim` tags
8. Use multi-stage builds — compile in stage 1, copy only output to stage 2
9. Add `HEALTHCHECK` — verify app is actually working, not just running
10. Combine `RUN` instructions — use `&& \` to reduce layer count

**Node.js specific:**

```dockerfile
# ✅ Always use this — npm doesn't forward OS signals properly
CMD ["node", "dist/index.js"]

# ❌ Never use this — causes broken container shutdowns
CMD ["npm", "start"]
```

---

## 20. AI-Assisted Development Practices

- **Plan first** — write plan to `tasks/todo.md` with checkable items before any implementation
- **Verify plan** — check in before starting implementation
- **Track progress** — mark items complete as you go
- **Capture lessons** — update `tasks/lessons.md` after every correction or mistake
- **Verification before done** — never mark task complete without proving it works
- **Demand elegance** — for non-trivial changes, ask "is there a more elegant solution?"
- **Simplicity first** — make every change as simple as possible, minimal code impact

---

## 21. Node.js Production Standards

```typescript
// ✅ Always register unhandled rejection handler in entry point
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

// ✅ Always use return await — never return a bare promise
// Reason: missing await drops function from error stack trace
const getUser = async (id: string) => {
  return await User.findById(id); // ✅
  return User.findById(id); // ❌ — lost from stack trace on error
};

// ✅ Subscribe to Mongoose connection events
mongoose.connection.on("error", (err) => console.error("Mongoose error:", err));
mongoose.connection.on("disconnected", () =>
  console.warn("MongoDB disconnected"),
);

// ✅ Validate NODE_ENV in Zod env config
NODE_ENV: z.enum(["development", "production", "test"]);
```

**Rules:**

- Use `npm ci` instead of `npm install` in Dockerfile and CI pipeline — `npm ci` strictly follows `package-lock.json`, `npm install` can silently upgrade packages
- Never use `npm start` in Docker — use `node dist/index.js` directly

---
