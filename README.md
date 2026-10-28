# Curio --- Curiosity-Driven Social Discovery

Curio is a social knowledge-discovery platform designed to make learning
feel effortless. Users can explore interesting ideas, facts, and
educational content in short sessions, discover new topics, and revisit
content they find useful.

> **Project status:** Feature availability depends on the current
> repository implementation and configured services. Verify each
> workflow before describing it as production-ready.

## Features

-   Knowledge feed for bite-sized educational and discovery-oriented
    content.
-   Topic/category-based content discovery.
-   Authentication and account access.
-   Post management through the existing admin/content-management
    workflow.
-   Optional source name and URL attribution for posts.
-   User profiles; profile editing depends on the current
    implementation.
-   Photo posts, multi-image carousels, and short-form video/Reels are
    part of the planned content experience. Confirm uploads, storage,
    APIs, and feed rendering are all connected before treating each
    format as complete.
-   Responsive web interface.

## Technology Stack

  -----------------------------------------------------------------------
  Layer                               Technology
  ----------------------------------- -----------------------------------
  Frontend                            React, Vite, JavaScript

  Backend                             Node.js, Express

  Database                            MongoDB with Mongoose

  Authentication                      JWT-based authentication

  Media storage                       Cloudinary environment
                                      configuration is supported;
                                      credentials/integration may be
                                      required

  API                                 REST
  -----------------------------------------------------------------------

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

## Prerequisites

-   Node.js version supported by the project's package files
-   npm
-   MongoDB running locally or a MongoDB Atlas connection string
-   Git
-   Media-storage credentials if image/video uploads are enabled

## Getting Started

### 1. Clone the repository

``` bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd curio
```

Replace the placeholder URL with your repository's actual URL.

### 2. Install backend dependencies

``` bash
cd server
npm install
```

### 3. Configure environment variables

Create the backend environment file expected by the code, commonly
`server/.env`. Use the example below as a reference and confirm variable
names against the server implementation.

``` dotenv
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/curio
JWT_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

  Variable                  Purpose
  ------------------------- ---------------------------------------------------
  `PORT`                    Express server port
  `MONGODB_URI`             MongoDB connection string
  `JWT_SECRET`              Secret used for authentication tokens
  `FRONTEND_URL`            Frontend origin for CORS or related configuration
  `NODE_ENV`                Runtime environment
  `CLOUDINARY_CLOUD_NAME`   Cloudinary cloud name, if used
  `CLOUDINARY_API_KEY`      Cloudinary API key, if used
  `CLOUDINARY_API_SECRET`   Cloudinary API secret, if used

Never use an example JWT secret in production. Keep real credentials in
local environment files or the deployment provider's secret manager.
Never commit `.env` files or expose secrets in frontend code.

### 4. Start MongoDB

For local development, make sure MongoDB is running. The example URI
uses a local database named `curio`. For MongoDB Atlas, use the Atlas
connection string and configure database permissions and network access.

### 5. Start the backend

From `server/`, use a start script that exists in `server/package.json`.
Check available scripts with:

``` bash
npm run
```

Common scripts may be:

``` bash
npm run dev
```

or:

``` bash
npm start
```

The example configuration uses port `5001`; check terminal output if
your port differs.

### 6. Install and start the frontend

Open a second terminal:

``` bash
cd client
npm install
npm run dev
```

Vite commonly serves the frontend at `http://localhost:5173`. Use the
actual URL shown in the terminal.

## Seed Data

A seed script exists at `server/src/seed/seed.js`. From the `server/`
directory, run:

``` bash
npm run seed
```

This requires the `seed` script to be defined in `server/package.json`
and a working database connection. Review the script before running it
against any database containing important data. Use development seed
data locally; do not rely on sample credentials in production.


## Media Uploads

Photo, carousel, and video functionality requires the frontend, backend
API, database metadata, and media storage to work together.

Before testing uploads, verify that:

-   Media-storage credentials are configured on the backend.
-   Upload endpoints validate file types and file sizes.
-   Uploaded media URLs and metadata are saved in MongoDB.
-   Failed uploads show useful errors and do not create broken posts.
-   Protected content-management endpoints check permissions.

Do not store large image/video files directly in MongoDB. Store files
with a suitable storage provider and save their metadata and URLs in the
database. If media credentials are empty, uploads may not work until
storage is configured.

## Development Checks

Inspect the scripts available in each package:

``` bash
# Run inside server/
npm run

# Run inside client/
npm run
```

A typical Vite production build is:

``` bash
cd client
npm run build
```

Before merging changes, manually verify:

1.  Registration and login.
2.  Feed loading and post details.
3.  Supported content creation and admin management.
4.  Category filters and source links, if enabled.
5.  Profile editing, if implemented.
6.  Photo, carousel, and Reel uploads after configuring storage.
7.  Mobile and desktop layouts.
8.  Backend authorization for admin-only operations.

Record any tests that could not run because a database, service, or
credential was unavailable.

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