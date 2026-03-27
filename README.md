# TicIt 

> Turn Your Tasks Into Achievements 

A gamified task manager. Built to go beyond the typical todo app — TicIt tracks streaks, XP, levels, and momentum to make productivity actually engaging.

Live API: `https://ticit-production.up.railway.app`

---

## What makes it different

Most todo apps just store tasks. TicIt treats productivity like a game:

- Complete tasks to earn XP and level up
- Build daily streaks — miss a day and lose your streak (unless you have a freeze)
- Momentum score that reflects how productive you've actually been
- Bonus XP for completing tasks before their due date
- Daily goals with completion tracking

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt
- **Validation:** Zod
- **Testing:** Jest + Supertest + MongoDB Memory Server
- **Deployed:** Railway + MongoDB Atlas
- **CI:** GitHub Actions

---

## Architecture
```
routes → services → database
```

- Routes handle HTTP only (request/response)
- Services contain all business logic (streaks, XP, momentum, priority scoring)
- Clean separation means logic is testable in isolation
```
src/
├── config/          # Environment config, DB connection
├── middleware/      # Auth, validation, error handling, logging
├── models/          # Mongoose schemas (User, Task)
├── routes/          # Express route handlers
├── schemas/         # Zod validation schemas
├── services/        # Business logic layer
├── tests/           # Jest test suite
└── utils/           # Priority scoring, AppError class
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login, returns JWT |
| GET | `/auth/me` | Get current user profile |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get all tasks (supports filtering, sorting, pagination) |
| GET | `/tasks/:id` | Get a single task |
| POST | `/tasks` | Create a task |
| PATCH | `/tasks/:id` | Update a task (triggers XP/streak logic) |
| PUT | `/tasks/:id` | Full task replace |
| DELETE | `/tasks/:id` | Delete a task (admin only) |
| GET | `/tasks/stats` | Get productivity stats and gamification data |

#### Query Parameters for GET /tasks
| Param | Example | Description |
|-------|---------|-------------|
| `search` | `?search=gym` | Search by title |
| `completed` | `?completed=true` | Filter by status |
| `sort` | `?sort=priorityScore_desc` | Sort results |
| `page` | `?page=2` | Pagination |
| `limit` | `?limit=10` | Results per page |

---

## Gamification System

**XP & Levels**
- +10 XP per completed task
- +5 bonus XP for completing before due date
- Level up when XP reaches `level × 100`

**Streaks**
- Streak increases when you complete at least one task per day
- Miss a day → streak resets to 1
- Streak freeze protects you from losing your streak once

**Momentum Score**
- Calculated from streak + total completed tasks
- Bonus +20 when daily goal is hit
- Reflects overall productivity trend

**Priority Scoring**
- Tasks scored by priority (high/medium/low) minus days since creation
- Older tasks decay in score — keeps your list fresh

---

## Running Locally
```bash
git clone https://github.com/Mostafa-alsheikh/TicIt.git
cd TicIt
npm install
```

Create a `.env` file:
```
PORT=3000
JWT_SECRET=your_secret_key
MONGO_URI=mongodb://127.0.0.1:27017/ticit
```
```bash
node index.js
```

---

## Tests
```bash
npm test
```

Comprehensive tests covering auth, CRUD, pagination, search, sorting, role-based access, and input validation. Runs against an in-memory MongoDB instance — no real database needed.

---
## Planned Features

- Web Frontend
- Task Categories and Tagging
- Weekly productivity reports
- Social Features - Comparing streaks with friends
- Mobile app

---


## Author

Mostafa Al-Sheikh — [GitHub](https://github.com/Mostafa-alsheikh/TicIt)