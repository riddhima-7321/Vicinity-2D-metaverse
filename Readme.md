# Vicinity

Multiplayer video chat in a simple 2D space. Move around with the keyboard; video appears when you are near other people. Built with React, Node, Socket.io, and WebRTC.

## What you need

- Node.js (v14 or newer)
- npm

## Install

From the project root (the **Vicinity** folder):

```bash
cd server && npm install
cd client && npm install
```

## Run

**Production (single port, recommended for sharing):**

```bash
cd server/client
NODE_OPTIONS=--openssl-legacy-provider npm run build
cd ..
NODE_ENV=production node server.js
```

Open **http://localhost:3001**

**Development (hot reload for the UI):**

Terminal 1:

```bash
cd server && node server.js
```

Terminal 2:

```bash
cd server/client && npm start
```

Open **http://localhost:3000**

## Using the app

1. Create a room or join with a room ID someone shares with you.
2. Move with **WASD** or arrow keys.
3. Walk close to others to see their video. Use on-screen controls for mic, camera, and screen share.
4. Use the chat panel for text messages.

## Playing with others on a network

See **[SETUP.md](./SETUP.md)** for LAN access, tunnels (e.g. ngrok), and deployment notes.

To try **two players on your own laptop**, see **[TEST_LOCALLY.md](./TEST_LOCALLY.md)**.

## Config (optional)

Create `server/config.env` if you want to change the port or environment:

```env
PORT=3001
NODE_ENV=production
```

## Git and GitHub identity

Contributors on GitHub come from **commit authors** plus anyone listed on a **`Co-authored-by:`** line in the commit message.

This repo ships **`.githooks/prepare-commit-msg`** and **`.githooks/commit-msg`** so **`Co-authored-by:` lines are removed** before each commit completes (otherwise GitHub counts extra “contributors”).

**One-time setup (after clone):**

```bash
git config core.hooksPath .githooks
chmod +x .githooks/prepare-commit-msg .githooks/commit-msg
```

Do not use **`git commit --no-verify`** for normal work; it skips these hooks.

Optional project rule files under **`.cursor/rules/`** help keep commit messages free of automated co-author lines.

Use your GitHub email (from **Settings → Emails**) so commits attach to your profile:

```bash
git config user.email "YOUR_EMAIL_HERE"
git config user.name "abhinav"
```
