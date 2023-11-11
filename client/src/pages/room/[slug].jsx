import { useSocket } from '@/context/SocketProvider';
import React, { useCallback, useEffect, useState } from 'react'
import ReactPlayer from 'react-player';
import peer from '@/service/peer';

const RoomPage = () => {
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState(null)
    const [remoteStream, setRemoteStream] = useState(null)

    const handleUserJoined = useCallback(({ email, id }) => {
        console.log(`Email ${email} joined the room!`);
        setRemoteSocketId(id);
    }, []);

    const handleIncomingCall = useCallback(async ({ from, offer }) => {
        setRemoteSocketId(from);
        // console.log(`incoming call from ${from} with offer ${offer}`);
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
        // console.log("Call Accepted");

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
        [socket,
            handleUserJoined,
            handleIncomingCall,
            handleCallAccepted,
            handleNegoNeededIncoming,
            handleNegoFinal
        ]);

    const handleCallUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });

        //! create offer
        const offer = await peer.getOffer();
        //* send offer to remote user
        socket.emit("user:call", { to: remoteSocketId, offer })
        // set my stream
        setMyStream(stream);
    }, [remoteSocketId, socket]);

    return (
        <div className='flex flex-col items-center justify-center'>
            <h1 className='font-bold text-7xl md:text-5xl p-3'>RoomPage</h1>
            <h4 className='font-bold text-4xl md:text-xl p-3 mb-4'>{remoteSocketId ? "Connected" : "No One In Room"}</h4>
            {myStream &&
                <button className='callButton' onClick={sendStreams}>
                    Send Stream
                </button>
            }
            {remoteSocketId &&
                <button className='callButton' onClick={handleCallUser}>
                    CALL
                </button>
            }
            <div className="flex flex-row items-center justify-center">
                {
                    myStream &&
                    <div className='flex flex-col items-center justify-center'>
                        <h1 className='font-bold text-5xl md:text-3xl p-5'>
                            My Stream
                        </h1>
                        <ReactPlayer
                            url={myStream}
                            playing
                            muted
                            height={300}
                            width={500}
                        />
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