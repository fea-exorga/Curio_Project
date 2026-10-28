# Curio --- Curiosity-Driven Social Discovery

Curio is a social knowledge-discovery platform designed to make learning feel effortless. Users can explore interesting ideas, facts, and educational content in short sessions, discover new topics, and revisit content they find useful.

## Project links

- **Live application:** [https://curio-project.vercel.app](https://curio-project.vercel.app)
- **GitHub repository:** [https://github.com/fea-exorga/Curio_Project](https://github.com/fea-exorga/Curio_Project)
- **Demo video:** [https://drive.google.com/file/d/1BhLxgoj1nPrw6UXL6meUPE1QRzGD-c6F/view?usp=sharing](#demo-video)

## Problem and solution

Interesting, useful knowledge is scattered across long articles and busy social feeds. Curio gives curious readers a focused way to discover bite-sized explanations, explore topics, and return to ideas they want to remember.

## Who Curio is for

Curio is for students, lifelong learners, and readers who want to discover useful ideas in short sessions. Administrators can curate and publish content for the community.

## Features

- Personalized and following feeds for published posts.
- Explore search for posts and people, with category filters.
- Photo posts, multi-image carousels, and short video Reels.
- Post titles, captions, categories, and optional source links.
- User profiles with editable display name, bio, website, and avatar.
- Username and display-name search, with follow and unfollow actions.
- Saved posts, private collections, and collection-based organization.
- Admin tools to create, edit, publish, unpublish, and delete posts.
- Admin-managed categories available throughout the application.
- Server-side Cloudinary uploads for post media and profile photos.
- Responsive layouts, loading states, empty states, and error feedback.

## Technology stack

- **Frontend:** React 18, Vite, React Router, Tailwind CSS, Axios
- **Backend:** Node.js, Express 5
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT bearer tokens, HTTP-only cookies, bcrypt password hashing
- **Media storage:** Cloudinary
- **Deployment:** Vercel frontend, Render API, MongoDB Atlas database

## Architecture

The React application in `client/` calls the Express REST API in `server/`. The API authenticates users, enforces admin and ownership permissions, and stores users, posts, categories, follows, interactions, saved posts, and collections in MongoDB. Cloudinary stores uploaded image and video files; MongoDB stores their URLs and metadata.

```text
Browser → Vercel React app → Render Express API → MongoDB Atlas
                                      └────────→ Cloudinary media
```
## Project Structure

``` text
curio/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
├── server/                 # Express backend
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       └── seed/
└── README.md
```

Exact folders may evolve as development continues.

## Run locally

### Requirements

- Node.js 20 or later and npm
- A local MongoDB instance or MongoDB Atlas database
- Cloudinary credentials to use media uploads

### 1. Configure the API

Copy `server/.env.example` to `server/.env`. Set `MONGODB_URI` and replace the example `JWT_SECRET` with a private random value. Keep the development `FRONTEND_URL` as `http://localhost:5173` for local use.

The Cloudinary variables can stay empty while developing other features. Upload endpoints will report that media uploads are not configured until valid credentials are added.

From the project root:

```bash
cd server
npm install
npm run dev
```

The API normally listens on `http://localhost:5001`. Check the terminal if another port is configured.

### 2. Configure and run the client

Copy `client/.env.example` to `client/.env`. The default `VITE_API_URL` is `http://localhost:5001`.

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the Vite URL printed in the terminal, normally `http://localhost:5173`.

### Optional development seed data

The seed script is for development databases only and refuses to run when `NODE_ENV=production`. Create and promote an admin account first, then run:

```bash
cd server
npm run seed
```

The script adds example posts and skips titles that already exist. Do not run it against a production database.

## Environment variables

### API (`server/.env` or Render environment)

| Variable | Purpose |
| --- | --- |
| `PORT` | API port. Render supplies this automatically; local default is `5001`. |
| `MONGODB_URI` | MongoDB connection string. Required in production. |
| `JWT_SECRET` | Private JWT signing secret. Required; production value must be at least 32 characters and must not be an example placeholder. |
| `FRONTEND_URL` | Exact frontend origin allowed by CORS. In production, use the HTTPS Vercel origin with no route or query string. |
| `NODE_ENV` | Use `development` locally and `production` on Render. |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name; required with the next two variables to enable uploads. |
| `CLOUDINARY_API_KEY` | Cloudinary API key; keep it on the server. |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret; keep it private on the server. |

### Client (`client/.env` or Vercel environment)

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | API origin, such as `https://your-api.onrender.com`. Do not append `/api`; the client adds that path. |

Never put MongoDB credentials, JWT secrets, or the Cloudinary API secret in Vercel or in any `VITE_*` variable. Only the public API origin belongs in the client environment.

## Deployment

A typical deployment uses a frontend hosting service, a separate Node.js
backend host, MongoDB Atlas, and a media-storage provider.

1.  Push the repository to Git.
2.  Deploy the backend from `server/` with the correct install/start
    commands.
3.  Configure backend environment variables in the hosting provider.
4.  Configure MongoDB Atlas network access and database credentials.
5.  Deploy the frontend from `client/`.
6.  Set the frontend API base URL to the deployed backend URL using the
    variable name expected by the client code.
7.  Set `FRONTEND_URL` and CORS configuration to the deployed frontend
    origin.
8.  Configure media-storage credentials if uploads are used.
9.  Test login, feed loading, profile changes, content management, and
    uploads on the deployed app.

Do not assume deployment is complete until the deployed frontend
successfully communicates with the backend and database.

## Demo video

**Google Drive link:** https://drive.google.com/file/d/1BhLxgoj1nPrw6UXL6meUPE1QRzGD-c6F/view?usp=sharing

## Security Notes

-   Never commit `.env` files, API keys, JWT secrets, database
    passwords, or private credentials.
-   Keep a sanitized `.env.example` with placeholders only.
-   Validate and sanitize data on the backend.
-   Enforce permissions in backend middleware/controllers.
-   Never allow profile updates to change roles or protected fields.
-   Do not trust client-supplied author IDs or admin roles.
-   Use HTTPS in production.
-   Review seed scripts for development credentials before deploying.
-   Set upload limits and validate uploaded media.

## Roadmap

Potential future improvements:

-   Complete and polish photo, carousel, and Reels workflows.
-   Finish profile editing and avatar uploads.
-   Improve discovery and topic-based filtering.
-   Improve accessibility and mobile interactions.
-   Add automated tests for authentication, authorization, uploads, and
    post workflows.
-   Improve moderation, source attribution, and reporting.
-   Add deployment monitoring and operational documentation.

------------------------------------------------------------------------

Built as a curiosity-driven space for discovering something interesting
in just a few minutes.