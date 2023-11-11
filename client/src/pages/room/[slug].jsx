import { useSocket } from '@/context/SocketProvider';
import React, { useCallback, useEffect } from 'react'

const RoomPage = () => {
    const socket = useSocket();

    const handleUserJoined = useCallback(({ email, id }) => {
        console.log(`Email ${email} joined the room!`);
    }, [])

    useEffect(() => {
        socket.on("user:joined", handleUserJoined);

        return () => {
            socket.off("user:joined", handleUserJoined);
        };
    }, [socket, handleUserJoined]);

    return (
        <h1>RoomPage</h1>
    )
}

export default RoomPage;