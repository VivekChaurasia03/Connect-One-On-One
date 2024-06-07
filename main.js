let APP_ID = "6b7e7b7936784f829a69341d91da6e88";

let token = null;
let uid = String(Math.floor(Math.random() * 10000));

let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);
let roomId = urlParams.get("room");

if (!roomId) {
    window.location = "lobby.html";
}

let client;
let channel;

let localStream;
let remoteStream;
let peerConnection;

const servers = {
    iceServers: [
        {
            urls: [
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
            ],
        },
    ],
};

let constraints = {
    video: {
        width: { min: 640, ideal: 1920, max: 1920 },
        height: { min: 480, ideal: 1080, max: 1080 },
    },
    audio: true,
};

let init = async () => {
    try {
        client = await AgoraRTM.createInstance(APP_ID);
        await client.login({ uid, token });

        channel = client.createChannel(roomId);
        await channel.join();

        channel.on("MemberJoined", handleUserJoined);
        channel.on("MemberLeft", handleUserLeft);

        client.on("MessageFromPeer", handleMessageFromPeer);

        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        document.getElementById("user-1").srcObject = localStream;
    } catch (error) {
        console.error("Failed to initialize:", error);
    }
};

let handleUserJoined = async (MemberID) => {
    // console.log("New User joined the channel: ", MemberID);
    await createOffer(MemberID);
};

let handleUserLeft = (MemberID) => {
    // console.log("User left the channel: ", MemberID);
    document.getElementById("user-2").style.display = "none";
    document.getElementById("user-2").classList.remove("smallFrame");
};

let handleMessageFromPeer = async (message, MemberId) => {
    message = JSON.parse(message.text);

    if (message.type === "offer") {
        await createAnswer(MemberId, message.offer);
    } else if (message.type === "answer") {
        await addAnswer(message.answer);
    } else if (message.type === "candidate") {
        if (peerConnection) {
            await peerConnection.addIceCandidate(message.candidate);
        }
    } else if (message.type === "mic") {
        let remoteAudioTrack = remoteStream
            .getTracks()
            .find((track) => track.kind === "audio");
        if (remoteAudioTrack) remoteAudioTrack.enabled = message.status;
    }
};

let createPeerConnection = async (MemberID) => {
    peerConnection = new RTCPeerConnection(servers);
    remoteStream = new MediaStream();
    document.getElementById("user-2").srcObject = remoteStream;
    document.getElementById("user-2").style.display = "block";
    document.getElementById("user-2").classList.add("smallFrame");

    if (!localStream) {
        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        document.getElementById("user-1").srcObject = localStream;
    }

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
        });
    };

    peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
            await client.sendMessageToPeer(
                {
                    text: JSON.stringify({
                        type: "candidate",
                        candidate: event.candidate,
                    }),
                },
                MemberID
            );
        }
    };
};

let createOffer = async (MemberID) => {
    await createPeerConnection(MemberID);

    let offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    await client.sendMessageToPeer(
        { text: JSON.stringify({ type: "offer", offer: offer }) },
        MemberID
    );
};

let createAnswer = async (MemberID, offer) => {
    await createPeerConnection(MemberID);

    await peerConnection.setRemoteDescription(offer);

    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    await client.sendMessageToPeer(
        { text: JSON.stringify({ type: "answer", answer: answer }) },
        MemberID
    );
};

let addAnswer = async (answer) => {
    if (!peerConnection.currentRemoteDescription) {
        await peerConnection.setRemoteDescription(answer);
    }
};

let leaveChannel = async () => {
    if (channel) {
        await channel.leave();
    }
    if (client) {
        await client.logout();
    }
};

let toggleCamera = async () => {
    if (localStream) {
        let videoTrack = localStream
            .getTracks()
            .find((track) => track.kind === "video");
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            document.getElementById("camera-btn").style.backgroundColor =
                videoTrack.enabled
                    ? "rgb(179, 102, 249, .9)"
                    : "rgb(255, 80, 80)";
        }
    }
};

let toggleMic = async () => {
    if (localStream) {
        let audioTrack = localStream
            .getTracks()
            .find((track) => track.kind === "audio");
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            document.getElementById("mic-btn").style.backgroundColor =
                audioTrack.enabled
                    ? "rgb(179, 102, 249, .9)"
                    : "rgb(255, 80, 80)";
            let message = JSON.stringify({
                type: "mic",
                status: audioTrack.enabled,
            });
            await channel.sendMessage({ text: message });
        }
    }
};

window.addEventListener("beforeunload", leaveChannel);
window.addEventListener("unload", leaveChannel);

document.getElementById("camera-btn").addEventListener("click", toggleCamera);
document.getElementById("mic-btn").addEventListener("click", toggleMic);

init();
