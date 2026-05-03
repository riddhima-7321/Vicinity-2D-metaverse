import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import "./Room.css";
import Sketch from "react-p5";
import styled from "styled-components";
import Chat from "./Chat";
import RoomSetup from "./RoomSetup";
import Model from "./Model";
import "font-awesome/css/font-awesome.min.css";
import imag from "./Sprites/char-idle.png";
import imagu from "./Sprites/char-run-f.gif";
import imagr from "./Sprites/char-run-r-1.gif";
import imagl from "./Sprites/char-run-l.gif";
import imagd from "./Sprites/char-run-2.gif";
import imagg from "./Sprites/char-idle-green-1.png";
import imago from "./Sprites/char-idle-orange-1.png";
import bg1 from "./Sprites/bg-8.png";
import imaggb from "./Sprites/char-run-b-g.gif";
import imaggf from "./Sprites/char-run-f-g.gif";
import imaggl from "./Sprites/char-run-l-g.gif";
import imaggr from "./Sprites/char-run-r-g.gif";
import imagob from "./Sprites/char-run-b-o.gif";
import imagof from "./Sprites/char-run-f-o.gif";
import imagol from "./Sprites/char-run-l-o.gif";
import imagor from "./Sprites/char-run-r-o.gif";
let img,
  imgu,
  imgr,
  imgl,
  bg,
  imgd,
  imgg,
  imgo,
  imggb,
  imggf,
  imggl,
  imggr,
  imgob,
  imgof,
  imgol,
  imgor;
let keypressed = false;
let greenUsed = false;
let fr = 60;
var twoLeft = false;
var userNum = null;
let colorSet = [];
let tempUsers = [];
<script
  src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta2/js/all.min.js"
  integrity="sha512-cyAbuGborsD25bhT/uz++wPqrh5cqPh1ULJz4NSpN9ktWcA6Hnh9g+CWKeNx2R0fgQt+ybRXdabSBgYXkQTTmA=="
  crossorigin="anonymous"
  referrerpolicy="no-referrer"
></script>;
// Connect to backend server (port 3001) not the React dev server (port 3000)
const getSocketURL = () => {
  if (process.env.REACT_APP_SERVER_URL) {
    return process.env.REACT_APP_SERVER_URL;
  }
  // In development, React runs on 3000, backend on 3001
  if (window.location.port === '3000') {
    return 'http://localhost:3001';
  }
  return window.location.origin;
};

const socket = io.connect(getSocketURL());

const PROXIMITY_SQ = 150 * 150;
const playersAreNear = (a, b) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy <= PROXIMITY_SQ;
};

const peerConnectionConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

// Debug socket connection
socket.on("connect", () => {
  console.log("Socket connected! ID:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Socket disconnected");
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});

const StyledVideo = styled.video`
  height: 100%;
  width: 100%;
`;

const Video = (props) => {
  const ref = useRef();
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!props.peer) {
      return;
    }

    let mounted = true;

    // Listen for stream event from simple-peer
    const handleStream = (remoteStream) => {
      if (!mounted) return;

      try {
        if (remoteStream && ref.current) {
          ref.current.srcObject = remoteStream;
          setStream(remoteStream);
          setError(null);
          ref.current.play?.().catch(() => {});
        }
      } catch (err) {
        console.error("Error setting video stream:", err);
        setError("Failed to load video stream");
      }
    };

    try {
      props.peer.on("stream", handleStream);
      if (
        props.peer._remoteStreams &&
        Array.isArray(props.peer._remoteStreams) &&
        props.peer._remoteStreams.length > 0
      ) {
        handleStream(props.peer._remoteStreams[0]);
      } else if (
        props.peer.streams &&
        Array.isArray(props.peer.streams) &&
        props.peer.streams.length > 0
      ) {
        handleStream(props.peer.streams[0]);
      }
    } catch (err) {
      console.error("Error accessing peer streams:", err);
      setError("Connection error");
    }

    // Also listen for errors
    const handleError = (err) => {
      console.error("Peer error in Video component:", err);
      setError("Connection error");
    };

    if (props.peer.on) {
      props.peer.on('error', handleError);
    }

    // Cleanup
    return () => {
      mounted = false;
      try {
        if (props.peer && props.peer.removeListener) {
          props.peer.removeListener('stream', handleStream);
          props.peer.removeListener('error', handleError);
        }
      } catch (err) {
        // Ignore cleanup errors
      }
      if (ref.current && ref.current.srcObject) {
        try {
          ref.current.srcObject.getTracks().forEach(track => {
            track.stop();
          });
        } catch (err) {
          // Ignore stop errors
        }
      }
    };
  }, [props.peer]);

  if (error) {
    return <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px' }}>{error}</div>;
  }

  if (!stream) {
    return <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px' }}>Connecting...</div>;
  }

  return <StyledVideo playsInline autoPlay ref={ref} muted={false} />;
};

function Room(props) {
  const [aiEnabled, setAiEnabled] = useState(false);
  const [name, setName] = useState("");
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [faces, setFaces] = useState(1);
  const [joinedRoom, setJoinedRoom] = useState(false);

  const [nearby, setNearby] = useState([]);
  const [users, setUsers] = useState([]);
  const usersRef = useRef([]);
  const keysDownRef = useRef({});
  const userVideo = useRef();
  const modelVideo = useRef();
  const peersRef = useRef([]);
  const roomID = props.match.params.roomID;

  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  useEffect(() => {
    if (!joinedRoom) {
      return;
    }
    const down = (e) => {
      if (e.repeat) return;
      keysDownRef.current[e.code] = true;
    };
    const up = (e) => {
      keysDownRef.current[e.code] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      keysDownRef.current = {};
    };
  }, [joinedRoom]);

  useEffect(() => {
    if (!joinedRoom) {
      return;
    }
    let localStream;

    const handleAllUsers = (users) => {
      console.log("Received all users:", users);
      users.forEach((userID) => {
        const peer = createPeer(userID, socket.id, localStream);
        peersRef.current.push({
          peerID: userID,
          peer,
        });
      });
    };

    const handleUserJoined = (payload) => {
      const peer = addPeer(payload.signal, payload.callerID, localStream);
      peersRef.current.push({
        peerID: payload.callerID,
        peer,
      });
    };

    const handleReceivingReturnedSignal = (payload) => {
      const item = peersRef.current.find((p) => p.peerID === payload.id);
      if (item) {
        item.peer.signal(payload.signal);
      }
    };

    const handleUserLeft = (id) => {
      const peerObj = peersRef.current.find((p) => p.peerID === id);
      if (peerObj) {
        peerObj.peer.destroy();
      }
      const peers = peersRef.current.filter((p) => p.peerID !== id);
      peersRef.current = peers;
      setNearby((prevNearby) => prevNearby.filter((p) => p.peerID !== id));
    };

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStream = stream;
        userVideo.current.srcObject = stream;
        userVideo.current.play?.().catch(() => {});
        modelVideo.current = {};
        modelVideo.current.srcObject = stream;
        if (!cam) {
          cameraOnOff();
        }
        if (!mic) {
          muteUnmute();
        }
        console.log("Emitting join room:", { roomID: roomID, name: name });
        socket.emit("join room", { roomID: roomID, name: name });
        socket.on("all users", handleAllUsers);
        socket.on("user joined", handleUserJoined);
        socket.on("receiving returned signal", handleReceivingReturnedSignal);
        socket.on("user left", handleUserLeft);
      });

    return () => {
      socket.off("all users", handleAllUsers);
      socket.off("user joined", handleUserJoined);
      socket.off("receiving returned signal", handleReceivingReturnedSignal);
      socket.off("user left", handleUserLeft);
    };
  }, [joinedRoom]);

  const createPeer = (userToSignal, callerID, stream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
      config: peerConnectionConfig,
    });

    peer.on("signal", (signal) => {
      socket.emit("sending signal", { userToSignal, callerID, signal });
    });

    peer.on("error", (err) => {
      console.error("Peer connection error:", err);
    });

    peer.on("connect", () => {
      console.log("Peer connected:", callerID);
    });

    return peer;
  };

  const addPeer = (incomingSignal, callerID, stream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
      config: peerConnectionConfig,
    });

    peer.on("signal", (signal) => {
      socket.emit("returning signal", { signal, callerID });
    });

    peer.on("error", (err) => {
      console.error("Peer connection error:", err);
    });

    peer.on("connect", () => {
      console.log("Peer connected:", callerID);
    });

    peer.signal(incomingSignal);

    return peer;
  };

  useEffect(() => {
    const handleReceiveMove = (data) => {
      try {
        console.log("handleReceiveMove called with:", data);
        if (!data || !data.all || !Array.isArray(data.all)) {
          console.log("Invalid data received:", data);
          return;
        }
        
        console.log("Setting users array with", data.all.length, "users");
        usersRef.current = data.all;
        setUsers(data.all);
        var me = {};
        for (let i = 0; i < data.all.length; i++) {
          if (data.all[i].id === socket.id) {
            me = data.all[i];
            break;
          }
        }
        
        console.log("Found me:", me, "Socket ID:", socket.id);

        // Only update nearby if me exists and has valid coordinates
        if (!me || me.x === undefined || me.y === undefined) {
          setNearby([]);
          return;
        }

      var tempNearby = [];
      for (let i = 0; i < data.all.length; i++) {
        if (data.all[i].id === socket.id) {
          continue;
        }
          if (data.all[i].x === undefined || data.all[i].y === undefined) {
            continue;
          }
        if (playersAreNear(data.all[i], me)) {
          for (var j = 0; j < peersRef.current.length; j++) {
            if (peersRef.current[j].peerID === data.all[i].id) {
              tempNearby.push({
                peerObj: peersRef.current[j],
                name: data.all[i].name,
                  peerID: data.all[i].id,
              });
                break;
              }
            }
          }
        }

        setNearby(tempNearby);
      } catch (error) {
        console.error("Error handling receive move:", error);
      }
    };

    socket.on("receive move", handleReceiveMove);

    return () => {
      socket.off("receive move", handleReceiveMove);
    };
  }, [socket]);

  useEffect(() => {
    if (!joinedRoom) {
      return;
    }

    if (faces === 0) {
      userVideo.current.srcObject.getVideoTracks()[0].enabled = false;
      userVideo.current.srcObject.getAudioTracks()[0].enabled = false;
    } else {
      if (cam) {
        userVideo.current.srcObject.getVideoTracks()[0].enabled = true;
      }
      if (mic) {
        userVideo.current.srcObject.getAudioTracks()[0].enabled = true;
      }
    }
  }, [faces]);

  const muteUnmute = (e) => {
    const enabled = userVideo.current.srcObject.getAudioTracks()[0].enabled;
    if (enabled) {
      userVideo.current.srcObject.getAudioTracks()[0].enabled = false;
      setMic(false);
    } else {
      userVideo.current.srcObject.getAudioTracks()[0].enabled = true;
      setMic(true);
    }
    const muteBtn = document.querySelector(".mute-1");
    muteBtn.classList.toggle("whitened");
  };

  const cameraOnOff = (e) => {
    const enabled = userVideo.current.srcObject.getVideoTracks()[0].enabled;
    if (enabled) {
      userVideo.current.srcObject.getVideoTracks()[0].enabled = false;
      setCam(false);
    } else {
      userVideo.current.srcObject.getVideoTracks()[0].enabled = true;
      setCam(true);
    }
    const cameraBtn = document.querySelector(".camera-1");
    cameraBtn.classList.toggle("cameraOff");
  };

  const screenShare = (e) => {
    navigator.mediaDevices
      .getDisplayMedia({
        cursor: true,
      })
      .then((screen) => {
        const screenTrack = screen.getVideoTracks()[0];
        userVideo.current.srcObject = screen;
        for (let i = 0; i < peersRef.current.length; i++) {
          let p = peersRef.current[i].peer;
          p.streams[0].getVideoTracks()[0].stop();
          p.replaceTrack(
            p.streams[0].getVideoTracks()[0],
            screenTrack,
            p.streams[0]
          );
        }

        screenTrack.onended = () => {
          navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
              const videoTrack = stream.getVideoTracks()[0];
              userVideo.current.srcObject = stream;
              for (let i = 0; i < peersRef.current.length; i++) {
                let p = peersRef.current[i].peer;
                p.streams[0].getVideoTracks()[0].stop();
                p.replaceTrack(
                  p.streams[0].getVideoTracks()[0],
                  videoTrack,
                  p.streams[0]
                );
              }
            });
        };
      });
  };

  let preload = (p5) => {
    img = p5.loadImage(imag);
    imgu = p5.loadImage(imagu);
    imgr = p5.loadImage(imagr);
    imgl = p5.loadImage(imagl);
    imgd = p5.loadImage(imagd);
    bg = p5.loadImage(bg1);
    imgg = p5.loadImage(imagg);
    imgo = p5.loadImage(imago);
    imggb = p5.loadImage(imaggb);
    imggf = p5.loadImage(imaggf);
    imggl = p5.loadImage(imaggl);
    imggr = p5.loadImage(imaggr);
    imgob = p5.loadImage(imagob);
    imgof = p5.loadImage(imagof);
    imgol = p5.loadImage(imagol);
    imgor = p5.loadImage(imagor);
  };

  let setup = (p5, canvas) => {
    p5.frameRate(fr);
    let canv = p5.createCanvas(924, 500).parent(canvas);
    if (canv && canv.elt) {
      canv.elt.setAttribute("tabindex", "0");
      canv.elt.style.outline = "none";
    }
    // Don't add user here - server will send initial positions when joining room
    // The server handles user position tracking
  };

  let draw = (p5) => {
    const users = usersRef.current;
    const k = keysDownRef.current;

    // Draw background even if images are still loading
    if (bg && bg.width > 0) {
      p5.background(bg);
    } else {
      // Fallback background color while images load
      p5.background(50, 50, 50);
      // Show loading text
      p5.fill(255);
      p5.textAlign(p5.CENTER);
      p5.textSize(20);
      p5.text("Loading map...", 462, 250);
      if (!bg) {
        console.log("Background image not loaded yet");
      }
    }
    
    // Don't draw users if array is empty
    if (users.length === 0) {
      // Show loading text
      p5.fill(255);
      p5.textAlign(p5.CENTER);
      p5.textSize(16);
      p5.text("Waiting for players...", 462, 280);
      return;
    }
    
    let idx = users.findIndex((user) => user.id === socket.id);
    
    // Debug: log if user not found
    if (idx === -1 && users.length > 0) {
      if (Math.random() < 0.01) { // Log 1% of the time to avoid spam
        console.log("User not found in array. Socket ID:", socket.id, "Users:", users.map(u => u.id));
      }
    }
    
    if (idx !== -1) {
      // Create a copy of current user for movement
      let currentUser = { ...users[idx] };
      currentUser.direction = null;
      keypressed = false;
      
      // Ensure user has valid coordinates
      if (currentUser.x === undefined || currentUser.y === undefined) {
        currentUser.x = 462;
        currentUser.y = 100;
      }
      
      if (k.KeyW || k.ArrowUp) {
        keypressed = true;
        currentUser.y = currentUser.y - 2;
        if (imgu && imgu.width > 0) {
          p5.image(imgu, currentUser.x, currentUser.y);
        } else if (img && img.width > 0) {
          p5.image(img, currentUser.x, currentUser.y);
        }
        currentUser.direction = "w";
      } else if (k.KeyA || k.ArrowLeft) {
        keypressed = true;
        currentUser.x = currentUser.x - 2;
        if (imgl && imgl.width > 0) {
          p5.image(imgl, currentUser.x, currentUser.y);
        } else if (img && img.width > 0) {
          p5.image(img, currentUser.x, currentUser.y);
        }
        currentUser.direction = "a";
      } else if (k.KeyS || k.ArrowDown) {
        keypressed = true;
        currentUser.y = currentUser.y + 2;
        if (imgd && imgd.width > 0) {
          p5.image(imgd, currentUser.x, currentUser.y);
        } else if (img && img.width > 0) {
          p5.image(img, currentUser.x, currentUser.y);
        }
        currentUser.direction = "s";
      } else if (k.KeyD || k.ArrowRight) {
        keypressed = true;
        currentUser.x = currentUser.x + 2;
        if (imgr && imgr.width > 0) {
          p5.image(imgr, currentUser.x, currentUser.y);
        } else if (img && img.width > 0) {
          p5.image(img, currentUser.x, currentUser.y);
        }
        currentUser.direction = "d";
      } else if (k.Escape) {
        currentUser.quit = true;
      }
      
      // Always draw idle sprite when not moving
      if (!keypressed && currentUser.quit !== true) {
        if (img && img.width > 0) {
          p5.image(img, currentUser.x, currentUser.y);
        } else {
          // Fallback: draw a rectangle if image not loaded
          p5.fill(255, 0, 0);
          p5.rect(currentUser.x, currentUser.y, 20, 20);
        }
      }
      
      // Send movement update to server
      let data = {
        id: socket.id,
        room: roomID,
        x: currentUser.x,
        y: currentUser.y,
        direction: currentUser.direction,
        quit: currentUser.quit,
      };
      socket.emit("send move", data);
    } else if (users.length > 0) {
      // User not in array yet - draw a placeholder
      p5.fill(255, 255, 0);
      p5.textAlign(p5.CENTER);
      p5.textSize(12);
      p5.text("Waiting for position...", 462, 250);
    }

    // Draw other players
    for (let i = 0; i < users.length; i++) {
      if (i === idx || users[i].quit === true) {
        continue;
      }
      if (i === userNum) {
        continue;
      }
      
      const user = users[i];
      let spriteToDraw = null;
      
      // Determine which sprite to use based on player count and color assignment
      if (twoLeft && users.length === 3) {
        // Special case for 3 players
        if (user.direction == "w" && imggb) spriteToDraw = imggb;
        else if (user.direction == "s" && imggf) spriteToDraw = imggf;
        else if (user.direction == "a" && imggl) spriteToDraw = imggl;
        else if (user.direction == "d" && imggr) spriteToDraw = imggr;
        else if (imgg) spriteToDraw = imgg;
      } else if (colorSet[i] == "g") {
        // Green player
        if (user.direction == "w" && imggb) spriteToDraw = imggb;
        else if (user.direction == "s" && imggf) spriteToDraw = imggf;
        else if (user.direction == "a" && imggl) spriteToDraw = imggl;
        else if (user.direction == "d" && imggr) spriteToDraw = imggr;
        else if (imgg) spriteToDraw = imgg;
      } else if (colorSet[i] == "o") {
        // Orange player
        if (user.direction == "w" && imgob) spriteToDraw = imgob;
        else if (user.direction == "s" && imgof) spriteToDraw = imgof;
        else if (user.direction == "a" && imgol) spriteToDraw = imgol;
        else if (user.direction == "d" && imgor) spriteToDraw = imgor;
        else if (imgo) spriteToDraw = imgo;
      } else if (users.length == 2) {
        // Two players - default to green
        if (user.direction == "w" && imggb) spriteToDraw = imggb;
        else if (user.direction == "s" && imggf) spriteToDraw = imggf;
        else if (user.direction == "a" && imggl) spriteToDraw = imggl;
        else if (user.direction == "d" && imggr) spriteToDraw = imggr;
        else if (imgg) spriteToDraw = imgg;
      } else if (users.length > 2) {
        // More than 2 players - assign colors
        if (!colorSet[i]) {
          colorSet[i] = greenUsed ? "o" : "g";
          greenUsed = !greenUsed;
      }
      if (colorSet[i] == "g") {
          if (user.direction == "w" && imggb) spriteToDraw = imggb;
          else if (user.direction == "s" && imggf) spriteToDraw = imggf;
          else if (user.direction == "a" && imggl) spriteToDraw = imggl;
          else if (user.direction == "d" && imggr) spriteToDraw = imggr;
          else if (imgg) spriteToDraw = imgg;
        } else {
          if (user.direction == "w" && imgob) spriteToDraw = imgob;
          else if (user.direction == "s" && imgof) spriteToDraw = imgof;
          else if (user.direction == "a" && imgol) spriteToDraw = imgol;
          else if (user.direction == "d" && imgor) spriteToDraw = imgor;
          else if (imgo) spriteToDraw = imgo;
        }
      }
      
      // Draw the sprite if it exists
      if (spriteToDraw) {
        p5.image(spriteToDraw, user.x, user.y);
      }
    }
  };
  // const setFalse = () => {
  //   let idx = users.findIndex((user) => user.id === socket.id);
  //   if (tempFine) {
  //     users[idx].quit = false;
  //   }
  //   return;
  // };
  const leaveRoom = () => {
    const list = usersRef.current;
    const idx = list.findIndex((user) => user.id === socket.id);
    if (idx !== -1) {
      socket.emit("send move", {
        id: socket.id,
        room: roomID,
        x: list[idx].x,
        y: list[idx].y,
        direction: list[idx].direction,
        quit: true,
      });
    }
    props.history.push(`/`);
  };

  useEffect(() => {
    const me = users.find((u) => u.id === socket.id);
    if (me && me.quit === true) {
      props.history.push(`/`);
    }
  }, [users, props.history]);

  const handleAiToggle = () => {
    if (aiEnabled) {
      setAiEnabled(false);
    } else {
      setAiEnabled(true);
    }
    const aiBtn = document.querySelector(".enable-ai");
    aiBtn.classList.toggle("aiBtnOn");
  };

  return (
    <div>
      {joinedRoom ? (
        <div className="room">
          <div className="video-canvas">
            <div className="buttonbox">
              <button
                type="button"
                className="mute-1"
                onClick={(e) => muteUnmute(e)}
              >
                {" "}
                <i className="fa fa-microphone-slash"></i>{" "}
              </button>
              <button
                type="button"
                className="camera-1"
                onClick={(e) => cameraOnOff(e)}
              >
                {" "}
                <i className="fa fa-camera"></i>{" "}
              </button>
              <button
                type="button"
                className="screenshare-1"
                onClick={(e) => screenShare(e)}
              >
                {" "}
                <i className="fa fa-desktop"></i>{" "}
              </button>
            </div>
            <div className="videobox">
              <div className="video-container">
                <p className="person-name">{name}</p>
                <div className="video-style">
                  <StyledVideo
                    className="video-room"
                    muted
                    ref={userVideo}
                    autoPlay
                    playsInline
                  />
                </div>
              </div>
              {nearby.map((peer, index) => {
                if (!peer || !peer.peerObj || !peer.peerObj.peer) {
                  return null;
                }
                return (
                  <div key={peer.peerID || index} className="video-container-peer">
                    <p className="person-name-peer">{peer.name || "Unknown"}</p>
                    <div className="video-style-peer">
                      <Video peer={peer.peerObj.peer} />
                    </div>
                  </div>
                );
              })}
            </div>
            <Sketch
              setup={setup}
              draw={draw}
              preload={preload}
              className="canvas"
            />
            <button className="leave-room" onClick={(e) => leaveRoom()}>
              Leave Room
            </button>
          </div>
          <div>
            <button className="enable-ai" onClick={(e) => handleAiToggle()}>
              Enable Auto Video Controller AI
            </button>
            {aiEnabled ? (
              <Model
                streamRef={modelVideo}
                setFaces={(faces) => setFaces(faces)}
              />
            ) : (
              <div></div>
            )}
            <Chat className="chat" socket={socket} room={roomID} name={name} />
          </div>
        </div>
      ) : (
        <RoomSetup
          setJoinedRoom={() => setJoinedRoom(true)}
          setMic={(preference) => setMic(preference)}
          setCam={(preference) => setCam(preference)}
          setName={(name) => setName(name)}
        />
      )}
    </div>
  );
}

export default Room;
