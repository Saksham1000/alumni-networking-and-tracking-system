# Alumni Networking System

Alumni Networking System is a full-stack web platform that helps universities connect students with alumni. It ships with a Django REST + Channels backend, a React frontend, smart recommendation logic, and collaboration tooling (networking, chat, events, jobs, admin analytics).

## Architecture Summary

- **Backend (`alumni_system`, `users`, `events`, `jobs`)**
  - Django 5.2, Django REST Framework, Simple JWT for token auth
  - Channels + ASGI for real-time messaging via `ws://<host>/ws/chat/<room>/?token=...`
  - SQLite dev database (`db.sqlite3`) with media uploads under `media/`
- **Frontend (`alumni-frontend`)**
  - React 18 (Create React App) + MUI + Axios client (`src/utils/api.js`) targeting `http://127.0.0.1:8000/api`
  - Context providers for auth, notifications, chat; page set covering dashboards, messaging, job board, events, admin, etc.
- **Realtime Layer**
  - `alumni_system/asgi.py` wires HTTP + WebSocket protocols.
  - Default `InMemoryChannelLayer`; switch to Redis in production.

```
alumni-networking-system/
├─ alumni_system/         # Django project config, ASGI routing
├─ users/                 # Custom user model, feed, recommendations, chat
├─ events/                # Event CRUD + RSVP
├─ jobs/                  # Job board, likes, comments
├─ alumni-frontend/       # React SPA (pages/, components/, context/, utils/)
├─ media/                 # Uploaded files (profile pictures, posts, etc.)
├─ manage.py
└─ requirements.txt       # Backend dependencies
```

## Core Features

- **Authentication & Roles** – Student/alumni/admin roles, JWT login (`/api/users/login/`), profile approvals.
- **Profiles & Search** – Rich profiles (skills, experience, social links, media), global search, alumni filter endpoints, and public profile endpoints for marketing pages.
- **Networking** – Connection requests, endorsements, long-form recommendations, and admin moderation for reports.
- **Feed & Content** – Post creation with images, threaded comments, likes on posts and comments, public feed endpoint for landing page.
- **Messaging** – RESTful message history plus Channels-powered live chat rooms (`users/consumers.py`) secured with JWT query tokens.
- **Events Module** – Audience-restricted RSVPs, attendee tracking, public upcoming events feed.
- **Job Board** – Alumni-authored job posts, comments, likes, and public job listings.
- **Notifications & Analytics** – Notification center, unread counters, admin metrics endpoint (`admin_dashboard`) used by frontend dashboards.
- **Recommendations Engine** – `users/recommendation.py` enhances alumni matching using custom synonym dictionaries and cosine-like scoring, reused by search endpoints and dashboard cards.
- **Public APIs** – Public stats (`/api/users/public-stats/`), featured alumni, events, jobs powering unauthenticated homepage sections.

## Requirements

| Layer      | Version Highlights                                   |
|------------|------------------------------------------------------|
| Backend    | Python 3.11+, Django 5.2.3, DRF 3.15, Channels 4.0   |
| Auth       | djangorestframework-simplejwt 5.3.0                  |
| Frontend   | Node 20+, React 18.3, react-router 7.6, MUI 7.1      |
| Dev Tools  | sqlite3 (bundled), npm 10+, pip 24+                  |

> ⚠️ If you enable the optional Grappelli admin skin (`alumni_system/urls.py`), install `django-grappelli` (not pinned in `requirements.txt`).

## Backend Setup

```powershell
cd D:\alumni-networking-system
py -3.11 -m venv .venv
.\.venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

- Uploaded media is stored under `media/`; during development Django serves it automatically when `DEBUG=True`.
- For real-time chat in production, run ASGI via Daphne or Uvicorn and switch `CHANNEL_LAYERS['default']` to Redis:

```powershell
pip install redis channels-redis
set CHANNEL_LAYERS_DEFAULT=channels_redis.core.RedisChannelLayer
daphne -b 0.0.0.0 -p 8000 alumni_system.asgi:application
```

## Frontend Setup

```powershell
cd D:\alumni-networking-system\alumni-frontend
npm install
npm start
```

- CRA serves on `http://localhost:3000` by default.
- API base URL lives in `src/utils/api.js`. For different environments, replace the hardcoded value with `process.env.REACT_APP_API_BASE_URL`.
- WebSocket clients should connect to the ASGI host (e.g., `ws://127.0.0.1:8000/ws/chat/<room>/`) and include `?token=<access JWT>` so `ChatConsumer` can authenticate the socket.

## Running Tests

- **Backend**: `python manage.py test users events jobs`
- **Frontend**: `npm test` (Jest + React Testing Library)

## Key API Surface

| Module   | Endpoint Highlights                                                       |
|----------|---------------------------------------------------------------------------|
| Users    | `/api/users/register/`, `/login/`, `/profile/`, `/feed/`, `/connections/` |
| Search   | `/api/users/search/?q=...`, `/alumni/search/`, `/public-stats/`           |
| Posts    | `/api/users/posts/`, `/posts/<id>/like/`, `/posts/<id>/comments/`         |
| Messaging| `/api/users/messages/`, `/messages/with/<user_id>/`, `/messages/unread-count/` |
| Events   | `/api/events/`, `/api/events/<id>/rsvp/`, `/api/events/public/`           |
| Jobs     | `/api/jobs/`, `/api/jobs/<id>/`, `/api/jobs/<id>/like/`, `/api/jobs/public/` |
| Admin    | `/api/users/admin/dashboard/`, `/api/users/reports/`                      |
| Public   | `/api/users/public-alumni/`, `/api/users/public-profile/<id>/`            |

Consult `users/urls.py`, `events/urls.py`, and `jobs/urls.py` for the exhaustive list.

## Deployment Notes

- **Secrets & Debug**: Move `SECRET_KEY`, `ALLOWED_HOSTS`, and DB credentials into environment variables before production.
- **Static/Media**: Use `collectstatic` and serve via CDN/reverse proxy; add persistent storage for `media/`.
- **Database**: Replace SQLite with PostgreSQL/MySQL in `alumni_system/settings.py`.
- **Channel Layer**: Replace in-memory layer with Redis for horizontal scaling and persistence.
- **CI/CD**: Add testing & linting steps (`python -m black`, `flake8`, `npm run build`) before deployment.
