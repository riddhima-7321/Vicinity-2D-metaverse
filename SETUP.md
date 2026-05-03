# Vicinity — setup (networks and multiplayer)

For install and everyday run commands, use **[Readme.md](./Readme.md)**. This file covers **how others connect** (same Wi‑Fi, internet, or hosting).

## Project layout

```
vicinity/
├── server/
│   ├── server.js
│   ├── client/          # React app
│   └── config.env       # optional — see Readme
└── package.json
```

## Rooms

1. One person creates a room and copies the **room ID** (from the UI or URL).
2. Everyone else opens the **same app URL**, enters a name, pastes that room ID, and joins.

Same room ID + same server = same space.

## Same Wi‑Fi (LAN)

1. On the machine running the server, find its LAN IP (e.g. `192.168.x.x`):

   - **macOS / Linux:** `ifconfig` or `ip addr` and look for your Wi‑Fi interface.
   - **Windows:** `ipconfig` → IPv4 address.

2. Run the app in production mode so everything is served on one port (see Readme).

3. Other devices open: `http://YOUR_LAN_IP:3001` (change port if you set `PORT` in `config.env`).

4. Everyone uses the **same** room ID to meet in one room.

## Different networks (internet)

You need a **public URL** that reaches your server on port **3001** (or whatever you configured).

**Quick test — tunnel (e.g. ngrok):**

1. Start the server (production mode from Readme).
2. Run something like: `ngrok http 3001`
3. Share the `https://…` URL ngrok prints. Others open it and join with your room ID.

Tunnels are fine for demos; they are not ideal for long-term production.

**Home network:** Forward **3001** on your router to your PC’s LAN IP, then share `http://YOUR_PUBLIC_IP:3001`. Opening firewall/router ports has security implications—only do this if you understand the risks.

**Hosting:** Deploy the Node server (and static build) like any Express app. The repo may include a `Procfile` for platforms that use it. Point your deployment at the same `PORT`/HTTPS setup your host expects.

## Development: phone or second PC on your LAN

With `npm start` the UI is on **3000** and the API/socket server on **3001**. Other devices must reach **both** correctly.

1. Create `server/client/.env`:

   ```env
   REACT_APP_SERVER_URL=http://YOUR_LAN_IP:3001
   ```

   Use the LAN IP of the machine running the server.

2. Restart the React dev server.

3. On the other device, open `http://YOUR_LAN_IP:3000`.

## Troubleshooting

- **Cannot connect:** Firewall must allow **3001** (and **3000** in dev). Same room ID on all clients.
- **Video fails over the internet:** Prefer **HTTPS** (ngrok and most hosts provide this). Browsers restrict camera/mic on insecure origins in many cases.
- **No video:** Allow camera and microphone in the browser; click the game area so keys focus correctly.

## Quick local test (two windows)

To try two players on one computer, see **[TEST_LOCALLY.md](./TEST_LOCALLY.md)**.
