# Running the YatraSathi Backend Locally

When asked to run, test, or interact with the YatraSathi backend locally, agents must follow these rules:

1. **Current Working Directory:**
   Always run commands from the `backend/` directory (`/Users/pareshparimal/IdeaProjects/hackathon/yatraSathi/backend`).

2. **Dependencies:**
   The backend requires PostgreSQL and Redis. If they are not running, start them using Docker Compose:
   ```bash
   docker compose up -d
   ```
   *(Note: Ensure Docker is installed and running on the host machine).*

3. **Running the Application:**
   Run the Spring Boot application using the Gradle wrapper:
   ```bash
   ./gradlew bootRun
   ```

4. **Environment Variables:**
   The backend requires environment variables to function correctly (otherwise it falls back to mock behavior). When starting the app for testing, explicitly pass the required keys:
   ```bash
   TELEGRAM_BOT_TOKEN="your_telegram_token" GEMINI_API_KEY="your_gemini_key" ./gradlew bootRun
   ```

5. **Compilation Checks:**
   Always run `./gradlew classes` to ensure the backend compiles without syntax errors before committing changes.
