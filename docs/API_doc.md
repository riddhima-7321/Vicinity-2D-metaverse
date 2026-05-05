# API & Real-Time Events Documentation

## Overview

Vicinity 2D Metaverse backend primarily uses **WebSockets (Socket.IO)** for real-time communication instead of traditional REST APIs.

This document outlines all the real-time events used for communication between client and server.

---

## Connection Event

### `connection`

* Triggered when a client connects to the server
* Initializes socket communication

---

## Room Management

### `join room`

**Description:**
Allows a user to join a specific room.

**Payload:**

```json
{
  "roomID": "string",
  "name": "string"
}
```

**Server Actions:**

* Adds user to room
* Assigns initial position
* Emits:

  * `all users`
  * `receive move`

---

### `all users`

**Description:**
Returns list of existing users in the room (excluding current user)

**Payload:**

```json
["socketId1", "socketId2"]
```

---

## WebRTC Signaling (Peer Connection)

### `sending signal`

**Description:**
Used to initiate peer-to-peer connection

**Payload:**

```json
{
  "userToSignal": "socketId",
  "callerID": "socketId",
  "signal": "object"
}
```

---

### `user joined`

**Description:**
Emitted to target user when a new peer joins

---

### `returning signal`

**Description:**
Returns signal to establish connection

---

### `receiving returned signal`

**Description:**
Completes peer-to-peer connection setup

---

## Messaging System

### `send message`

**Description:**
Sends a message to users in the same room

**Payload:**
Any message object

---

### `receive message`

**Description:**
Broadcasts message to other users in the room

---

## Movement System (Core Feature)

### `send move`

**Description:**
Sends updated player position and state

**Payload:**

```json
{
  "id": "socketId",
  "x": number,
  "y": number,
  "direction": "string",
  "quit": boolean,
  "room": "roomID"
}
```

---

### `receive move`

**Description:**
Broadcasts updated positions of all users

**Payload:**

```json
{
  "all": [],
  "me": {}
}
```

---

## Disconnection Handling

### `disconnect`

**Description:**
Triggered when a user leaves

**Server Actions:**

* Removes user from room
* Updates position list
* Emits:

  * `user left`
  * `receive move`

---

### `user left`

**Description:**
Notifies other users when someone disconnects

**Payload:**

```json
"socketId"
```

---

## Static Serving (Production)

* Serves frontend from `client/build`
* Handles all routes using React Router

---

## Summary

* Communication is **event-driven**
* No traditional REST endpoints
* Uses **Socket.IO for real-time updates**
* Handles:

  * Room management
  * Messaging
  * Movement synchronization
  * Peer-to-peer signaling

---

## Future Improvements

* Add REST APIs for authentication
* Implement validation for socket events
* Add rate limiting and security checks
