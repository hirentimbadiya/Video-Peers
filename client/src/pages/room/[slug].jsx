import { useSocket } from '@/context/SocketProvider';
import React, { useCallback, useEffect, useState } from 'react'
import ReactPlayer from 'react-player';

const RoomPage = () => {
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState(null)

    const handleUserJoined = useCallback(({ email, id }) => {
        console.log(`Email ${email} joined the room!`);
        setRemoteSocketId(id);
    }, [])

    useEffect(() => {
        socket.on("user:joined", handleUserJoined);

        return () => {
            socket.off("user:joined", handleUserJoined);
        };
    }, [socket, handleUserJoined]);

    const handleCallUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });

        setMyStream(stream);
    }, [])

    return (
        <div className='flex flex-col items-center justify-center'>
            <h1 className='font-bold text-7xl md:text-5xl p-5'>RoomPage</h1>
            <h4 className='font-bold text-4xl md:text-xl p-5'>{remoteSocketId ? "Connected" : "No One In Room"}</h4>
            {remoteSocketId &&
                <button className='callButton' onClick={handleCallUser}>
                    CALL
                </button>
            }
            {
                myStream &&
                <>
                    <h1 className='font-bold text-7xl md:text-5xl p-5'>My Stream</h1>
                    <ReactPlayer
                        url={myStream}
                        playing
                        muted
                        height={300}
                        width={500}
                    />
                </>
            }
        </div>
    )
}

export default RoomPage;