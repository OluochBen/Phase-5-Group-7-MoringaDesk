## Setup Instructions

1. **Install dependencies**:
   ```bash
   pipenv install
   ```

2. **Activate virtual environment**:
   ```bash
   pipenv shell
   ```

3. **Install reuired libraries**:
   ```bash
   cd backend
   pipenv install -r requirements.txt
   ```

4. **Set up Environment Variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Initialize Database with Migrations**
   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   python seed.py
   ```

6. **Run the application**:
   ```bash
   cd backend (if not in the backend folder)
   python app.py

Find a ttached postman collection and environment for api testing and backend intergration to the frontend