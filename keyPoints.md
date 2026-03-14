# FreelanceFlow — Developer Notes

> Quick reference for patterns and concepts learned during development.
> Not for memorizing — for quick lookup when you forget syntax.

---

## MongoDB Queries

| Query       | What It Does                           | Example                                     |
| ----------- | -------------------------------------- | ------------------------------------------- |
| `$addToSet` | Add to array but prevent duplicates    | `{ $addToSet: { savedBy: userId } }`        |
| `$push`     | Add to array (allows duplicates)       | `{ $push: { items: item } }`                |
| `$in`       | Match any value in array               | `{ skills: { $in: ["React", "Node"] } }`    |
| `$gte`      | Greater than or equal                  | `{ price: { $gte: 500 } }`                  |
| `$lte`      | Less than or equal                     | `{ price: { $lte: 1000 } }`                 |
| `$text`     | Full text search (requires text index) | `{ $text: { $search: "react developer" } }` |

---

## Mongoose Methods

| Method                                | What It Does                                         | When To Use                                    |
| ------------------------------------- | ---------------------------------------------------- | ---------------------------------------------- |
| `.lean()`                             | Returns plain JS object instead of Mongoose document | Read-only queries — 2-3x faster                |
| `.populate()`                         | Replaces ObjectId with actual document data          | When you need related document fields          |
| `{ new: true }`                       | Returns updated document instead of original         | After `findOneAndUpdate`                       |
| `findOneAndUpdate({ _id, clientId })` | Find + ownership check in one query                  | Preventing unauthorized updates                |
| `findOneAndDelete({ _id, clientId })` | Find + ownership check + delete                      | Preventing unauthorized deletes                |
| `Promise.all([query1, query2])`       | Run multiple queries simultaneously                  | Pagination — count + find at same time         |
| `validateBeforeSave: false`           | Skip full validation on partial save                 | When only updating one field like refreshToken |

---

## Pagination Pattern

```typescript
const skip = (page - 1) * limit;
// page 1 → skip 0  → documents 1-10
// page 2 → skip 10 → documents 11-20
// page 3 → skip 20 → documents 21-30

const [data, total] = await Promise.all([
  Model.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
  Model.countDocuments(query),
]);

return {
  data,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
};
```

---

## Dynamic Query Building Pattern

```typescript
// Start with base conditions
const query: Record<string, unknown> = { status: "open" };

// Add filters only if provided
if (filters.category) query["category"] = filters.category;
if (filters.search) query["$text"] = { $search: filters.search };
if (filters.skills?.length) query["skillsRequired"] = { $in: filters.skills };

// Pass to MongoDB
Model.find(query);
```

---

## JWT & Auth

| Concept              | Explanation                                                                       |
| -------------------- | --------------------------------------------------------------------------------- |
| Access token         | Short-lived (15min). Sent in Authorization header. Stored in memory on frontend   |
| Refresh token        | Long-lived (7d). Sent as httpOnly cookie. Used to get new access token            |
| Token rotation       | On every refresh — old token invalidated, new token issued                        |
| Hashed refresh token | Store SHA-256 hash in DB — plain token only in cookie. DB breach = useless tokens |
| `select: false`      | Field never returned in queries unless explicitly requested with `+fieldname`     |
| `jwt.verify()`       | Verifies signature AND expiry. Throws if invalid                                  |
| `jwt.sign()`         | Creates token with payload and secret                                             |

---

## Security Patterns

| Pattern                               | Why                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------- |
| Never expose which field failed login | "Invalid credentials" for both wrong email AND wrong password             |
| Mass assignment protection            | Always destructure allowed fields — never `Object.assign(user, req.body)` |
| Ownership check in query              | `findOne({ _id: id, userId: currentUser })` — not just `findById`         |
| `httpOnly` cookie                     | JavaScript can't read it — XSS safe                                       |
| `secure: true` in production          | Cookie only sent over HTTPS                                               |
| `sameSite: strict`                    | Cookie not sent on cross-site requests — CSRF protection                  |
| Rate limiting on auth routes          | Prevents brute force attacks                                              |
| Fail fast on missing env vars         | Crash at startup not at runtime                                           |

---

## Express Patterns

| Pattern         | Explanation                                        |
| --------------- | -------------------------------------------------- |
| `req.user.id`   | Identity — who is making the request (from JWT)    |
| `req.params.id` | Which resource to fetch (from URL)                 |
| `req.body`      | Data the user wants to create/update               |
| `req.query`     | Filters, pagination, search params                 |
| `next(error)`   | Pass error to global error handler                 |
| `_req`, `_res`  | Underscore prefix = intentionally unused parameter |

---

## Error Handling

```typescript
// Known errors — you throw intentionally
throw new AppError("Email already in use", 409);
throw new AppError("User not found", 404);
throw new AppError("Access denied", 403);
throw new AppError("Invalid credentials", 401);

// Unknown errors — happen on their own (DB crash, bug)
// Caught by global errorHandler → returns 500
```

---

## TypeScript Patterns

| Pattern                      | Explanation                                                   |
| ---------------------------- | ------------------------------------------------------------- |
| `z.infer<typeof schema>`     | Auto-generate TypeScript type from Zod schema                 |
| `as [string, ...string[]]`   | Tell TypeScript array has at least one item                   |
| `InstanceType<typeof Model>` | Type of a single Mongoose document                            |
| `declare global`             | Extend existing TypeScript interfaces                         |
| `unknown` over `any`         | Type-safe alternative — forces you to check type before using |

---

## Architecture Rules

| Rule                               | Why                                       |
| ---------------------------------- | ----------------------------------------- |
| Controllers call services          | Never put business logic in controllers   |
| Services throw errors              | Never catch in service — let it bubble up |
| Controllers catch with next(error) | Passes to global error handler            |
| One responsibility per file        | Easier to test, maintain, and extend      |
| `.js` extensions on all imports    | NodeNext module resolution requires it    |
| No raw `process.env`               | Always use typed config from `env.ts`     |

---

## HTTP Status Codes

| Code | Meaning      | When To Use                               |
| ---- | ------------ | ----------------------------------------- |
| 200  | OK           | Successful GET, PUT, DELETE               |
| 201  | Created      | Successful POST that creates resource     |
| 400  | Bad Request  | Validation error                          |
| 401  | Unauthorized | Missing or invalid token                  |
| 403  | Forbidden    | Valid token but wrong role/permissions    |
| 404  | Not Found    | Resource doesn't exist                    |
| 409  | Conflict     | Duplicate resource (email already in use) |
| 500  | Server Error | Unexpected error                          |

---

## Mongoose Indexes

```typescript
// Add indexes to fields you filter, search, or sort by
Schema.index({ userId: 1 }); // single field
Schema.index({ category: 1 }); // enum fields
Schema.index({ "budget.min": 1 }); // nested fields
Schema.index({ title: "text" }); // text search
Schema.index({ createdAt: -1 }); // sort fields

// 1 = ascending, -1 = descending
// Without indexes → full collection scan → slow at scale
```

---

## Response Format

```typescript
// Always follow this structure
// Success
{ success: true, data: { ... } }
{ success: true, message: "Done" }

// Paginated
{ success: true, data: [...], pagination: { page, limit, total, totalPages } }

// Error
{ success: false, message: "Error message" }
```

---

## Git Conventions

```
feat:     new feature
fix:      bug fix
chore:    setup, config, tooling
refactor: restructuring without behavior change
docs:     documentation only
test:     adding tests

Examples:
feat: add project creation endpoint
fix: hash refresh tokens in DB
chore: setup eslint and prettier
```

---

## Open/Closed Principle

> Every function, middleware, and config should be open for extension but closed for modification.

```typescript
// ❌ Not scalable — adding admin requires rewriting
roleMiddleware("client");

// ✅ Scalable — adding admin is one word
roleMiddleware("client", "admin");
```

---

## Zod v4 Changes

```typescript
// Email — deprecated method
z.string().email(); // ❌
z.email(); // ✅

// URL
z.string().url(); // ❌
z.url(); // ✅

// Native enum
z.nativeEnum(MyEnum); // ❌
z.enum(MyEnum); // ✅

// Error messages
z.string().min(2, { message: "Too short" }); // ❌
z.string().min(2, { error: "Too short" }); // ✅
```

---

## When To Use What Database Operation

| Situation             | Operation                                             |
| --------------------- | ----------------------------------------------------- |
| Create new document   | `Model.create(data)`                                  |
| Find one by ID        | `Model.findById(id)`                                  |
| Find one by field     | `Model.findOne({ field: value })`                     |
| Find many with filter | `Model.find(query)`                                   |
| Update and return new | `Model.findOneAndUpdate(filter, data, { new: true })` |
| Delete one            | `Model.findOneAndDelete(filter)`                      |
| Count documents       | `Model.countDocuments(query)`                         |
| Read-only query       | Add `.lean()` to any query                            |
| Join related data     | Add `.populate("fieldName", "field1 field2")`         |
