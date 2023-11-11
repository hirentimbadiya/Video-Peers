import { useSocket } from '@/context/SocketProvider';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react'

const LobbyScreen = () => {
    const [email, setEmail] = useState("");
    const [room, setRoom] = useState("");

    const socket = useSocket();
    const router = useRouter();
    // console.log(socket);

    const handleSubmitForm = useCallback((e) => {
        e.preventDefault();
        socket.emit('room:join', { email, room });
    }, [email, room, socket]);

    const handleJoinRoom = useCallback((data) => {
        const { email, room } = data;
        router.push(`/room/${room}`);
    }, [router]);

    useEffect(() => {
        socket.on("room:join", handleJoinRoom);
        return () => {
            socket.off("room:join", handleJoinRoom);
        }
    }, [socket, handleJoinRoom]);

    return (
        <div className='flex flex-col items-center justify-center'>
            <h1 className=' font-semibold mb-5 mt-5 '>Lobby</h1>
            <div>
                <form className='flex flex-col items-center justify-center'
                    onSubmit={handleSubmitForm}
                >
                    <label htmlFor="email">Email ID</label>
                    <input
                        type="email"
                        id='email'
                        value={email}
                        autoComplete='off'
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <br />
                    <label htmlFor="room">Room Number</label>
                    <input
                        type="text"
                        id='room'
                        autoComplete='off'
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                    />
                    <br />
                    <button className='joinButton'>
                        Join
                    </button>
                </form>
            </div>
        </div>
    )
}

export default LobbyScreen