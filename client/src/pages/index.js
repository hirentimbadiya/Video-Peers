import LobbyScreen from '@/components/Lobby';
import SocketProvider from '@/context/SocketProvider';

export default function Home() {
  return (
    <SocketProvider>
      <LobbyScreen />
    </SocketProvider>
  )
}
