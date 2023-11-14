import ReactPlayer from 'react-player';

const VideoPlayer = ({ stream, isAudioMute, name }) => (
    <div className={`flex flex-col w-full ${name === "My Stream" ? "flex-1" : "items-center justify-center"}`}>
        <div className={`${name === "My Stream" ? "absolute top-2 right-3 z-10" : "px-2"}`}>
            <h1 className='text-xl font-poppins font-semibold md:text-2xl mb-1 text-center'>
                {name === 'My Stream' ? 'My Stream' : 'Remote Stream'}
            </h1>
            <div className={`relative rounded-[30px] overflow-hidden
            ${name === "My Stream" ? "mmd:w-[140px] md:w-[200px] lg:w-[280px]" : "md:w-[600px]"}`}>
                <ReactPlayer
                    url={stream}
                    playing
                    muted={isAudioMute}
                    height="auto"
                    width="auto"
                />
            </div>
        </div>
    </div>
);

export default VideoPlayer;