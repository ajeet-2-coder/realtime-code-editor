import React, { useEffect, useState, useRef } from "react";
import {
    useLocation,
    useParams,
    Navigate,
    useNavigate,
} from "react-router-dom";
import Client from "../components/Client";
import Editor from "../components/Editor";
import socket from "../Socket";
import toast from "react-hot-toast"; 

const EditorPage = () => {
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [clients, setClients] = useState([]);
    const [language, setLanguage] = useState("cpp");
    const codeRef = useRef("");

    if (!location.state) {
        return <Navigate to="/" />;
    }

    useEffect(() => {
        socket.emit("join-room", {
            roomId,
            username: location.state.username,
        });

        socket.on("joined", ({ clients, socketId }) => {
            setClients(clients);

            socket.emit("sync-code", {
                socketId,
                code: codeRef.current,
            });

            socket.emit("sync-language", {
                socketId,
                language,
            });
        });

        socket.on("user-left", ({ socketId, username }) => {
    if (username) {
        toast(`${username} left the room`, {
            icon: "👋",
        });
    }

    setClients((prev) =>
        prev.filter((client) => client.socketId !== socketId)
    );
});

        socket.on("language-change", ({ language }) => {
            setLanguage(language);
        });

        socket.on("sync-language", ({ language }) => {
            setLanguage(language);
        });

        return () => {
            socket.off("joined");
            socket.off("user-left");
            socket.off("language-change");
            socket.off("sync-language");
        };
    }, [roomId]);

    const copyRoomId = async () => {
    try {
        await navigator.clipboard.writeText(roomId);

        toast.success("Room ID copied to clipboard!");
    } catch {
        toast.error("Copy failed");
    }
};

    const leaveRoom = () => {
        socket.emit("leave-room", { roomId });

        toast("You left the room");

        navigate("/");
    };

    return (
        <div className="mainWrap">
            <div className="aside">
                <div className="asideInner">
                    <div className="logo">
                        <img
                            src="/code-sync.png"
                            alt="logo"
                            className="logoImage"
                        />
                    </div>

                    <select
                        value={language}
                        onChange={(e) => {
                            const selected = e.target.value;
                            setLanguage(selected);

                            socket.emit("language-change", {
                                roomId,
                                language: selected,
                            });
                        }}
                    >
                        <option value="cpp">C++</option>
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                    </select>

                    <h3>Connected</h3>

                    <div className="clientsList">
                        {clients.map((client) => (
                            <Client
                                key={client.socketId}
                                username={client.username}
                            />
                        ))}
                    </div>
                </div>

                <div className="buttons">
                    <button className="copyBtn" onClick={copyRoomId}>
                        Copy Room ID
                    </button>

                    <button className="leaveBtn" onClick={leaveRoom}>
                        Leave
                    </button>
                </div>
            </div>

            <div className="editorWrap">
                <Editor
                    roomId={roomId}
                    language={language}
                    onCodeChange={(code) => {
                        codeRef.current = code;
                    }}
                />
            </div>
        </div>
    );
};

export default EditorPage;