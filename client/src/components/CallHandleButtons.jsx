// components/CallButtons.jsx
import MicOffIcon from '@mui/icons-material/MicOff';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';

const CallHandleButtons = ({ isAudioMute, isVideoOnHold, onToggleAudio, onToggleVideo, onEndCall }) => (
    <div className='flex space-x-4 mt-4 h-[75px] items-center justify-center w-96 rounded-md'>
        <div className='flex w-[100%] justify-evenly'>
            <button className="callButtons text-gray-700 border-gray-700 hover:bg-gray-700
        focust:ring-4 focus:ring-gray-300" onClick={onToggleAudio}>
                {isAudioMute ? <MicOffIcon fontSize="large" /> : <KeyboardVoiceIcon fontSize="large" />}
            </button>
            <button className="callButtons text-blue-700 border-blue-700 hover:bg-blue-700 
        focus:ring-4 focus:ring-blue-300"
                onClick={onToggleVideo}
            >
                {isVideoOnHold ? <VideocamIcon fontSize="large" /> : <VideocamOffIcon fontSize="large" />}
            </button>
            <button className="callButtons text-red-700 border-red-700 hover:bg-red-700
        focus:ring-4 focus:ring-red-700" onClick={onEndCall}>
                <CallEndIcon fontSize="large" />
            </button>
        </div>
    </div>
);
export default CallHandleButtons;
