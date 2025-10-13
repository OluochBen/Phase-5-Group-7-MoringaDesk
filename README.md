 # MoringaDesk

 ## Problem Statement
Students at Moringa (and in programming environments in general) often encounter the same technical problems. This leads to delays in getting help and duplication of effort when similar questions are asked repeatedly.

## Solution
MoringaDesk curates problems and solutions that students face. Each problem can have multiple solutions, and students can vote on or highlight the most useful ones. Problems are tagged and categorized for easy searching and filtering. The platform emphasizes API-first design for scalability.

 MoringaDesk is a collaborative platform designed to help students resolve recurring technical challenges by curating problems and community-driven solutions. Built with an API-first approach, it emphasizes scalability, searchability, and real-time feedback.

 ## Quick Links
- Frontend: https://moringadesk-gcvu.onrender.com/
- Backend: https://phase-5-group-7-moringadesk.onrender.com/ping

## Tech Stack
| Layer       | Technology              |
|------------|--------------------------|
| Frontend   | React.js, Redux Toolkit  |
| Backend    | Flask (Python)           |
| Database   | PostgreSQL               |
| Auth       | JWT (Role-based access)  |
| CI/CD      | GitHub Actions           |
| Testing    | Jest (Frontend), Pytest/Minitest (Backend) |
| Design     | Figma (Mobile-first)     |

---

## Features

### MVP Functionality
- Secure authentication (JWT)
- Raise categorized questions (language, stage, logic, technical)
- Reply to problems
- Vote on solutions
- Link similar problems
- FAQ system
- Notifications:
  - Votes on solutions
  - New answers
  - Updates on followed questions

### Admin Capabilities
- Manage user accounts
- Moderate content
- Create/update FAQs
- Generate reports on categories & contributors

---

## User Stories

### Student
- Register/login securely
- Raise and reply to questions
- Vote and highlight useful answers
- Follow questions and receive updates
- Search by tags and view related problems

### Admin
- Manage users and content
- Curate FAQs
- Monitor flagged activity
- Generate usage reports

---

## Setup Instructions

### Backend (Flask)
```bash
# Clone repo
git clone <git@github.com:OluochBen/Phase-5-Group-7-MoringaDesk.git>
cd backend

# Setup virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
flask run
```

## Frontend (React)
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` in both the project root and `frontend/` directory as needed, then fill in values.

- **Backend social login** (optional):
  - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
  - `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`
  - `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET`
  - `SOCIAL_DEFAULT_REDIRECT` (defaults to `http://localhost:5173/auth/callback`)
- **Frontend social login** (optional):
  - `VITE_SOCIAL_AUTH_CALLBACK_URL` (defaults to `http://localhost:5173/auth/callback`)

```bash
cp .env.example .env
```

## Gitflow & Collaboration

- Use feature branches (feature/<name>)
- Submit PRs with descriptive titles and commit messages
- Follow [Gitflow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
- Reference: [GitHub Actions CI/CD Guide](https://docs.github.com/en/actions)

## Testing
- Frontend: npm test (Jest)
- Backend: pytest or minitest
All features must include test coverage before deployment.

## API & Pagination
All list-returning endpoints must implement pagination for scalability. Refer to the API documentation for usage examples.

## License
This project is licensed under the MIT License.
