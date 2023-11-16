import { useSocket } from '@/context/SocketProvider';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import VideoCallIcon from '@mui/icons-material/VideoCall';

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
        <div className='flex flex-col items-center justify-center h-screen bg-gray-100'>
            <title>VideoPeers</title>
            <link rel="shortcut icon" href="../../public/favicon.ico" type="image/x-icon" />
            <h1 className='text-5xl font-[15px] mb-5 mt-5 text-center font-josefin tracking-tighter'>Video<VideoCallIcon sx={{ fontSize: 70, color: 'rgb(30,220,30)' }} />Peers</h1>
            <p className='text-2xl mt-2 mb-4 text-center md:max-w-[400px] max-w-[300px] text-gray-600'>
                Peer-to-Peer video calls, powered by <b>WebRTC!</b>
                <br />
                Bring People Closer Together.
            </p>
            <div className='bg-white p-6 rounded shadow-md'>
                <form className='flex flex-col items-center justify-center'
                    onSubmit={handleSubmitForm}
                >
                    <label htmlFor="email">Email ID</label>
                    <input
                        type="email"
                        id='email'
                        required
                        value={email}
                        autoComplete='off'
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <br />
                    <label htmlFor="room">Room Number</label>
                    <input
                        type="number"
                        id='room'
                        required
                        autoComplete='off'
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                    />
                    <br />
                    <button className='bg-blue-500 hover:bg-blue-600'>
                        Join
                    </button>
                </form>
            </div>
        </div>
    )
}

export default LobbyScreen