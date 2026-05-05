# System Architecture & Data Flow

## Overview

This document describes the end-to-end workflow of a virtual proximity system that enables real-time collaboration through avatar-based interaction. The architecture is divided into two primary layers: Frontend Clients and Backend Services.

---

## Frontend Clients

### 1. Client Interface (Web/App)

The workflow begins at the Client Interface, which serves as the entry point for all users accessing the system through either a web browser or a native application. From here, the system simultaneously initiates two parallel processes.

### 2. Capture User Inputs

The first branch captures physical user inputs from keyboard, mouse, or other input devices (KBM, Mouse). These inputs drive the user's actions within the virtual environment.

### 3. Initialize Virtual Identity

Concurrently with input capture, the system initializes a Virtual Identity for the user. This identity represents the user within the shared virtual space and is tied to their session and presence data.

### 4. Update Avatar State

Both input streams converge at the Avatar State Update step. Here, the system processes the captured inputs and identity data to update the avatar's current state, including its position within the virtual space and any actions being performed.

### 5. Movement Decision

Following the avatar state update, the system evaluates whether movement has occurred.

- **Yes (Movement Detected):** The updated avatar state is transmitted to the Vicinity Real-Time Server Cluster for further processing.
- **No (No Movement):** The system loops back and continues monitoring for input changes, keeping the avatar state current without pushing unnecessary updates to the backend.

---

## Backend Services

### 6. Vicinity Real-Time Server Cluster

The Vicinity Real-Time Server Cluster is the central processing hub of the backend. It receives avatar state data from connected clients and manages the shared virtual environment through three internal modules.

- **Management:** Oversees overall server operations, session handling, and resource allocation across the cluster.
- **Room Coordination:** Manages the logical structure of virtual rooms or zones within the environment, tracking which users occupy which spaces.
- **Avatar Proximity Detection:** Continuously calculates the spatial relationships between avatars to determine which users are near one another.

### 7. Downstream Processing

From the server cluster, the workflow branches into three parallel backend operations.

#### Identify Nearby Users (Module 2)

This module processes the proximity data produced by the server cluster to compile a list of users who are spatially adjacent to one another within the virtual environment. The output of this module feeds into the Cross Boundary decision.

**Cross Boundary Decision:**

- **Yes (Cross Boundary):** If the proximity check reveals that users are crossing into a new zone or room boundary, the system routes the event through the Control Room Access and Signaling module to manage access and broadcast the transition.
- **No (No Boundary Crossed):** The system routes the state directly to the Synchronized Knowledge Base for recording.

#### Control Room Access and Signaling

This module handles access control logic for virtual rooms, managing entry permissions and broadcasting signaling events to coordinate state transitions. It also feeds updates into the Synchronized Knowledge Base to ensure all room states and user positions remain consistent across the system.

#### Log Data and Assess (Module 3)

In parallel, all events and interactions are captured and assessed through the logging module. This produces two categories of persistent records.

- **User Session Logs:** Records of individual user sessions, tracking presence, duration, and activity within the environment.
- **Interaction Logs:** Granular logs of user-to-user interactions, proximity events, and communication instances.

### 8. Synchronized Knowledge Base

The Synchronized Knowledge Base acts as the shared state store for the system. It aggregates outputs from the proximity detection and room coordination modules to maintain a consistent, real-time view of the virtual environment across all connected clients and services.

### 9. Media Streaming (P2P via WebRTC)

When users are identified as being in proximity, a peer-to-peer media streaming connection is established directly between the relevant clients using WebRTC. This enables low-latency audio and video communication without routing media through the central server, reducing overhead and improving call quality.

---

## Outcome

The combined operation of these frontend and backend components delivers the following results.

- **Enhanced Team Productivity:** By enabling spontaneous, proximity-based interaction, teams can collaborate more naturally without the friction of scheduled calls or manual connection setup.
- **Stronger Culture:** The virtual presence model fosters a sense of shared space and community, helping distributed teams maintain connection and belonging.
- **Effective Communication:** Real-time avatar proximity detection paired with direct P2P media streaming ensures that communication is immediate, contextual, and high quality.