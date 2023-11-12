import { useSocket } from '@/context/SocketProvider';
import React, { useCallback, useEffect, useState } from 'react'
import ReactPlayer from 'react-player';
import peer from '@/service/peer';

const RoomPage = () => {
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isAudioMute, setIsAudioMute] = useState(false);
    const [isVideoOnHold, setIsVideoOnHold] = useState(false);
    const [callButton, setCallButton] = useState(true);

    const handleUserJoined = useCallback(({ email, id }) => {
        //! console.log(`Email ${email} joined the room!`);
        setRemoteSocketId(id);
    }, []);

    const handleIncomingCall = useCallback(async ({ from, offer }) => {
        setRemoteSocketId(from);
        //! console.log(`incoming call from ${from} with offer ${offer}`);
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });
        setMyStream(stream);

        const ans = await peer.getAnswer(offer);
        socket.emit("call:accepted", { to: from, ans });
    }, [socket]);

    const sendStreams = useCallback(() => {
        for (const track of myStream.getTracks()) {
            peer.peer.addTrack(track, myStream);
        }
    }, [myStream]);

    const handleCallAccepted = useCallback(({ from, ans }) => {
        peer.setLocalDescription(ans);
        //! console.log("Call Accepted");

        sendStreams();
    }, [sendStreams]);

    const handleNegoNeededIncoming = useCallback(async ({ from, offer }) => {
        const ans = await peer.getAnswer(offer);
        socket.emit("peer:nego:done", { to: from, ans });
    }, [socket]);


    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
    }, [remoteSocketId, socket]);

    const handleNegoFinal = useCallback(async ({ ans }) => {
        await peer.setLocalDescription(ans);
    }, [])

    useEffect(() => {
        peer.peer.addEventListener('negotiationneeded', handleNegoNeeded);

        return () => {
            peer.peer.removeEventListener('negotiationneeded', handleNegoNeeded);
        }
    }, [handleNegoNeeded]);


    useEffect(() => {
        peer.peer.addEventListener('track', async ev => {
            const remoteStream = ev.streams;
            console.log("GOT TRACKS!");
            setRemoteStream(remoteStream[0]);
        })
    }, [])

    useEffect(() => {
        socket.on("user:joined", handleUserJoined);
        socket.on("incoming:call", handleIncomingCall);
        socket.on("call:accepted", handleCallAccepted);
        socket.on("peer:nego:needed", handleNegoNeededIncoming);
        socket.on("peer:nego:final", handleNegoFinal);

        return () => {
            socket.off("user:joined", handleUserJoined);
            socket.off("incoming:call", handleIncomingCall);
            socket.off("call:accepted", handleCallAccepted);
            socket.off("peer:nego:needed", handleNegoNeededIncoming);
            socket.off("peer:nego:final", handleNegoFinal);
        };
    },
        [
            socket,
            handleUserJoined,
            handleIncomingCall,
            handleCallAccepted,
            handleNegoNeededIncoming,
            handleNegoFinal
        ]);


    useEffect(() => {
        socket.on("call:end", ({ from }) => {
            if (from === remoteSocketId) {
                peer.peer.close();

                if (myStream) {
                    myStream.getTracks().forEach(track => track.stop());
                    setMyStream(null);
                }

                setRemoteStream(null);
                setRemoteSocketId(null);
            }
        });
    }, [remoteSocketId, myStream, socket]);

    //* for disappearing call button
    useEffect(() => {
        socket.on("call:initiated", ({ from }) => {
            if (from === remoteSocketId) {
                setCallButton(false);
            }
        });
    }, [socket, remoteSocketId]);


    const handleCallUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });

        if (isAudioMute) {
            const audioTracks = stream.getAudioTracks();
            audioTracks.forEach(track => track.enabled = false);
        }

        if (isVideoOnHold) {
            const videoTracks = stream.getVideoTracks();
            videoTracks.forEach(track => track.enabled = false);
        }

        //! create offer
        const offer = await peer.getOffer();
        //* send offer to remote user
        socket.emit("user:call", { to: remoteSocketId, offer })
        // set my stream
        setMyStream(stream);

        // hide the call button
        setCallButton(false);
        // Inform the remote user to hide their "CALL" button
        socket.emit("call:initiated", { to: remoteSocketId });
    }, [remoteSocketId, socket, isAudioMute, isVideoOnHold, callButton]);


    const handleToggleAudio = () => {
        peer.toggleAudio();
        setIsAudioMute(!isAudioMute);
    };

    const handleToggleVideo = () => {
        peer.toggleVideo();
        setIsVideoOnHold(!isVideoOnHold);
    }

    const handleEndCall = useCallback(() => {
        peer.peer.close();

        if (myStream) {
            myStream.getTracks().forEach(track => track.stop());
            setMyStream(null);
        }

        setRemoteStream(null);

        if (remoteSocketId) {
            socket.emit("call:end", { to: remoteSocketId });
        }
        setRemoteSocketId(null);
    }, [myStream, remoteSocketId, socket]);

    return (
        <div className='flex flex-col items-center justify-center h-screen'>
            <h1 className='font-bold text-7xl md:text-5xl p-3'>RoomPage</h1>
            <h4 className='font-bold text-4xl md:text-xl p-3 mb-4'>{remoteSocketId ? "Connected" : "No One In Room"}</h4>
            {(myStream || remoteStream) &&
                <button className='callButton' onClick={sendStreams}>
                    Send Stream
                </button>
            }
            {(remoteSocketId && callButton) &&
                <button className='callButton' onClick={handleCallUser}>
                    CALL
                </button>
            }
            <div className="flex flex-row items-center justify-center space-x-4 mt-4">
                {
                    myStream &&
                    <div className='flex flex-col items-center justify-center'>
                        <h1 className='font-bold text-5xl md:text-3xl p-5'>
                            My Stream
                        </h1>
                        <ReactPlayer
                            url={myStream}
                            playing
                            muted={isAudioMute}
                            height={300}
                            width={500}
                        />
                        <div className='flex space-x-4 mt-4'>
                            <button className='joinButton' onClick={handleToggleAudio}>
                                {isAudioMute ? "Unmute" : "Mute"}
                            </button>
                            <button className='joinButton' onClick={handleToggleVideo}>
                                {isVideoOnHold ? "Resume Video" : "Hold Video"}
                            </button>
                            <button className='joinButton' onClick={handleEndCall}>
                                End Call
                            </button>
                        </div>
                    </div>
                }
                {
                    remoteStream &&
                    <div className='flex flex-col items-center justify-center'>
                        <h1 className='font-bold text-5xl md:text-3xl p-5'>
                            Remote Stream
                        </h1>
                        <ReactPlayer
                            url={remoteStream}
                            playing
                            height={300}
                            width={500}
                        />
                    </div>
                }
            </div>
        </div>
    )
}

export default RoomPage;