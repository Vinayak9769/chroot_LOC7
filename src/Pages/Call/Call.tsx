import { useRef, useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  getDocs,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { MoreVertical, Copy, PhoneOff } from "lucide-react";

type MenuProps = {
  joinCode: string;
  setJoinCode: (v: string) => void;
  setPage: (p: string) => void;
};

type VideosProps = {
  mode: string;
  callId: string;
  setPage: (p: string) => void;
};

const firebaseConfig = {
  apiKey: "AIzaSyClroqJi7PTRdFC1CWpsM4PHQbixZUJU8s",
  authDomain: "test-webrtc-be247.firebaseapp.com",
  projectId: "test-webrtc-be247",
  storageBucket: "test-webrtc-be247.firebasestorage.app",
  messagingSenderId: "505918780378",
  appId: "1:505918780378:web:af6de95c5f590c8c0146e3",
  measurementId: "G-HTDR501GGK",
};

const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

// ... Menu component remains the same ...
const Menu: React.FC<MenuProps> = ({ joinCode, setJoinCode, setPage }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8">
      <div className="w-full max-w-md">
        <button
          onClick={() => setPage("create")}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Call
        </button>
      </div>

      <div className="flex w-full max-w-md flex-col gap-4">
        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          placeholder="Join with code"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={() => setPage("join")}
          className="w-full rounded-lg bg-green-600 px-4 py-3 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Answer
        </button>
      </div>
    </div>
  );
};

const Videos: React.FC<VideosProps> = ({ mode, callId, setPage }) => {
  const [webcamActive, setWebcamActive] = useState(false);
  const [roomId, setRoomId] = useState(callId);
  const [error, setError] = useState("");
  const [isRetrying, setIsRetrying] = useState(false);
  const localRef = useRef<HTMLVideoElement | null>(null);
  const remoteRef = useRef<HTMLVideoElement | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    // Create a new RTCPeerConnection when the component mounts
    peerConnection.current = new RTCPeerConnection(servers);

    // Cleanup when component unmounts
    return () => {
      peerConnection.current?.close();
    };
  }, []);

  const setupSources = async () => {
    try {
      setError("");
      setIsRetrying(true);

      // Clean up existing streams
      if (localRef.current?.srcObject) {
        (localRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track: MediaStreamTrack) => track.stop());
      }
      if (remoteRef.current?.srcObject) {
        (remoteRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track: MediaStreamTrack) => track.stop());
      }

      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      const remoteStream = new MediaStream();

      localStream.getTracks().forEach((track) => {
        peerConnection.current?.addTrack(track, localStream);
      });

      peerConnection.current!.ontrack = (event: RTCTrackEvent) => {
        event.streams[0].getTracks().forEach((track: MediaStreamTrack) => {
          remoteStream.addTrack(track);
        });
      };

      if (localRef.current) localRef.current.srcObject = localStream;
      if (remoteRef.current) remoteRef.current.srcObject = remoteStream;

      setWebcamActive(true);
      setIsRetrying(false);

      if (mode === "create") {
        const callDoc = doc(collection(firestore, "calls"));
        const offerCandidates = collection(callDoc, "offerCandidates");
        const answerCandidates = collection(callDoc, "answerCandidates");

        setRoomId(callDoc.id);

        peerConnection.current!.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
          if (event.candidate) {
            setDoc(doc(offerCandidates), event.candidate.toJSON());
          }
        };

        const offerDescription = await peerConnection.current!.createOffer();
        await peerConnection.current!.setLocalDescription(offerDescription);

        await setDoc(callDoc, {
          offer: {
            sdp: offerDescription.sdp,
            type: offerDescription.type,
          },
        });

        onSnapshot(callDoc, (snapshot) => {
          const data = snapshot.data();
          if (!peerConnection.current?.currentRemoteDescription && data?.answer) {
            const answerDescription = new RTCSessionDescription(data.answer);
            peerConnection.current?.setRemoteDescription(answerDescription as any);
          }
        });

        onSnapshot(answerCandidates, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const candidate = new RTCIceCandidate(change.doc.data());
              peerConnection.current?.addIceCandidate(candidate as any);
            }
          });
        });
      } else if (mode === "join") {
        const callDoc = doc(firestore, "calls", callId);
        const answerCandidates = collection(callDoc, "answerCandidates");
        const offerCandidates = collection(callDoc, "offerCandidates");

        peerConnection.current!.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
          if (event.candidate) setDoc(doc(answerCandidates), event.candidate.toJSON());
        };

        const callData = (await getDoc(callDoc)).data();

        if (!callData) {
          throw new Error(
            "Call not found. The call might have ended or the code is incorrect."
          );
        }

        const offerDescription = callData.offer;
        await peerConnection.current!.setRemoteDescription(
          new RTCSessionDescription(offerDescription) as any
        );

        const answerDescription = await peerConnection.current!.createAnswer();
        await peerConnection.current!.setLocalDescription(answerDescription as any);

        await updateDoc(callDoc, {
          answer: {
            type: answerDescription.type,
            sdp: answerDescription.sdp,
          },
        });

        onSnapshot(offerCandidates, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                const candidate = new RTCIceCandidate(change.doc.data());
              peerConnection.current?.addIceCandidate(candidate as any);
            }
          });
        });
      }

      peerConnection.current!.onconnectionstatechange = () => {
        if (peerConnection.current?.connectionState === "disconnected") {
          hangUp();
        }
      };
    } catch (err) {
      console.error(err);
      setIsRetrying(false);
      const e = err as any;
      if (e?.name === "NotReadableError") {
        setError(
          "Camera or microphone is in use by another application. Please close other applications using your camera/microphone and try again."
        );
      } else if (e?.name === "NotFoundError") {
        setError(
          "No camera or microphone found. Please connect a device and try again."
        );
      } else if (e?.name === "NotAllowedError") {
        setError(
          "Camera/microphone permission denied. Please allow access and try again."
        );
      } else if (e?.message?.includes("Call not found")) {
        setError(e.message);
      } else {
        setError(
          "Failed to set up media devices. Please try again or use a different device."
        );
      }
    }
  };

  const hangUp = async () => {
    if (localRef.current?.srcObject) {
      (localRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track: MediaStreamTrack) => track.stop());
    }
    if (remoteRef.current?.srcObject) {
      (remoteRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track: MediaStreamTrack) => track.stop());
    }

    peerConnection.current?.close();

    if (roomId) {
      const roomRef = doc(firestore, "calls", roomId);
      const answerCandidates = await getDocs(
        collection(roomRef, "answerCandidates")
      );
      const offerCandidates = await getDocs(
        collection(roomRef, "offerCandidates")
      );

      answerCandidates.forEach(async (d) => await deleteDoc(d.ref));
      offerCandidates.forEach(async (d) => await deleteDoc(d.ref));
      await deleteDoc(roomRef);
    }

    window.location.reload();
  };

  // ... Rest of the Videos component (JSX) remains the same ...
  return (
    <div className="relative h-screen w-full bg-gray-900">
      <video
        ref={localRef}
        autoPlay
        playsInline
        muted
        className="absolute bottom-4 right-4 h-32 w-48 rounded-lg object-cover md:h-48 md:w-64"
      />
      <video
        ref={remoteRef}
        autoPlay
        playsInline
        className="h-full w-full object-cover"
      />

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform items-center gap-4">
        <button
          onClick={hangUp}
          disabled={!webcamActive}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
        >
          <PhoneOff size={24} />
        </button>

        <div className="group relative">
          <button className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
            <MoreVertical size={24} />
          </button>
          <div className="invisible absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform rounded-lg bg-white p-2 shadow-lg group-hover:visible">
            <button
              onClick={() => navigator.clipboard.writeText(roomId)}
              className="flex items-center gap-2 whitespace-nowrap px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              <Copy size={16} />
              Copy joining code
            </button>
          </div>
        </div>
      </div>

      {!webcamActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-medium">
              Turn on your camera and microphone and start the call
            </h3>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setPage("home")}
                className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={setupSources}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Call = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [joinCode, setJoinCode] = useState("");

  return (
    <div className="min-h-screen bg-gray-100">
      {currentPage === "home" ? (
        <Menu
          joinCode={joinCode}
          setJoinCode={setJoinCode}
          setPage={setCurrentPage}
        />
      ) : (
        <Videos mode={currentPage} callId={joinCode} setPage={setCurrentPage} />
      )}
    </div>
  );
};

export default Call;
