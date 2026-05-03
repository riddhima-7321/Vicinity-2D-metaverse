# Vicinity — test locally (two players, one computer)

Use this to check rooms, movement, chat, and video without a second device.

## 1. Start the server

From the project root, use **production** mode so both windows use the same URL (see **[Readme.md](./Readme.md)** for the exact build + start commands).

When it is running, open: **http://localhost:3001**

## 2. Open two separate sessions

Browsers often share one login/session per profile. Use **two different contexts**, for example:

- Two **incognito/private** windows, or  
- **Two different browsers** (e.g. Chrome and Firefox)

In **each** context, go to `http://localhost:3001`.

## 3. Player A — create a room

1. Enter a display name.
2. Click **Create new room**.
3. Copy the **room ID** from the screen or from the URL (`/room/...`).

## 4. Player B — join

1. Enter another display name.
2. Paste the same room ID.
3. Click **Join a room**.
4. Allow camera and microphone when the browser asks (in **both** windows).

## 5. Exercise the app

- Move with **WASD** or arrow keys (click the game area if keys do nothing).
- Move the two characters **close** to each other to see video.
- Try chat and mute/camera controls.

Arrange the windows side by side, or use two monitors if you have them.

## If something fails

- **Same room:** Both windows must use the **exact** same room ID and **localhost:3001** while testing locally.
- **No video:** Check permissions in both windows; try two browsers if one blocks a second camera stream.
- **Server not up:** Start it again from the Readme **Production** section.

For phones or other people on your network, use **[SETUP.md](./SETUP.md)**.
