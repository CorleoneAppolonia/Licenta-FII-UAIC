# End-to-End Steganography Chat (Starter)

This repository contains the initial scaffolding for an end-to-end chat experiment that will later incorporate encryption and steganography. The current implementation focuses on user management, friend relationships, plain-text messaging, and a proxy that records all traffic so you can inspect what a network observer would see.

## Project Layout

- `backend/` – Django REST API providing authentication, friend management, and messaging endpoints. Uses PostgreSQL and token-based auth.
- `proxy/` – Lightweight Flask service that forwards frontend traffic to the backend while logging request and response payloads.
- `frontend/` – React (Vite + TypeScript) client that interacts exclusively with the proxy.

## Prerequisites

- Python 3.13 (virtual environment already configured as `.venv/` when `configure_python_environment` was run)
- Node.js 18+
- PostgreSQL 14+

## Backend Setup

1. Copy environment template:
   ```powershell
   Copy-Item backend/.env.example backend/.env
   ```
2. Edit `backend/.env` with your PostgreSQL credentials.
3. Ensure the database (`POSTGRES_DB`) exists.
4. Install dependencies (already installed if you ran the provided pip commands):
   ```powershell
   C:/End-to-End_Crypto/.venv/Scripts/python.exe -m pip install -r backend/requirements.txt
   ```
5. Apply migrations and create a superuser (optional for admin UI):
    ```powershell
    Set-Location backend
    Get-Content .env | ForEach-Object {
       if ($_ -match '^(?<name>[^=]+)=(?<value>.*)$') {
          Set-Item -Path env:$($matches['name']) -Value $matches['value']
       }
    }
    C:/End-to-End_Crypto/.venv/Scripts/python.exe manage.py migrate
    C:/End-to-End_Crypto/.venv/Scripts/python.exe manage.py createsuperuser
    ```
6. Run the API server:
   ```powershell
   C:/End-to-End_Crypto/.venv/Scripts/python.exe manage.py runserver 0.0.0.0:8000
   ```

## Proxy Setup

1. Install dependencies:
   ```powershell
   C:/End-to-End_Crypto/.venv/Scripts/python.exe -m pip install -r proxy/requirements.txt
   ```
2. Start the proxy (defaults to `http://localhost:5000` and forwards to `http://localhost:8000`):
   ```powershell
   Set-Location proxy
   $env:BACKEND_URL="http://localhost:8000"
   # Optional: override proxy port (default 5000)
    $env:PORT="5012"
   C:/End-to-End_Crypto/.venv/Scripts/python.exe app.py
   ```
   When changing the proxy port, make sure `frontend/.env` sets `VITE_PROXY_URL` to the same origin (for example, `http://localhost:5012`).

## Frontend Setup

1. Copy environment template if you need to adjust the proxy URL:
   ```powershell
   Copy-Item frontend/.env.example frontend/.env
   ```
2. Install dependencies (done automatically when Vite scaffolded, but you can repeat):
   ```powershell
   Set-Location frontend
   npm install
   ```
3. Start the development server:
   ```powershell
   npm run dev -- --host
   ```
   The app expects the proxy at the origin defined by `VITE_PROXY_URL` (default `http://localhost:5000`).

## Usage (Definition of Done)

1. Register two users through the UI (registration returns an auth token and logs you in).
2. From User A:
   - Send a friend request to User B by username.
   - Verify the request appears under **Outgoing**.
3. From User B:
   - Log in and accept the pending request in **Incoming**.
   - The friend list should now contain User A.
4. Exchange plain-text messages via the chat panel.
5. Open the **Proxy Traffic** panel to observe the captured request/response bodies travelling through the proxy.

## Next Steps

- Implement encryption/steganography layers without breaking existing APIs.
- Harden authentication (rate limiting, password complexity policies, refresh tokens, etc.).
- Add automated tests (backend unit/integration, frontend component tests).
- Containerize services for easier local/start deployments.

## Troubleshooting

- If migrations fail with PostgreSQL authentication errors, verify the credentials in `backend/.env` and confirm the database server is running.
- The proxy stores the 1,000 most recent entries. Use the **Clear** button in the UI or send `DELETE /logs/` directly to reset it.
- Adjust CORS/CSRF settings in `backend/core/settings.py` if you run the frontend on a different origin.
