import React, { useEffect, useRef, useState } from 'react';
import '../styles/dashboard.css';

const HLSVideoPlayer = ({ streamUrl }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    // Set component as mounted
    setIsMounted(true);
    let hlsInstance = null;

    // Dynamically import hls.js
    const loadHls = async () => {
      if (!isMounted) return;

      try {
        const HlsModule = await import('hls.js');
        const Hls = HlsModule.default;
        
        const video = videoRef.current;
        if (!video || !isMounted) return;
        
        // Check if HLS is supported
        if (Hls.isSupported()) {
          // Clean up previous instance if it exists
          if (hlsRef.current) {
            hlsRef.current.destroy();
          }

          // Create new instance
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          
          hlsRef.current = hlsInstance;
          
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
            if (!isMounted) return;
            
            setIsLoading(false);
            
            // Attempt autoplay with both muted and unmuted options
            const attemptAutoplay = async () => {
              try {
                // First try unmuted autoplay (preferred)
                await video.play();
              } catch (err) {
                console.log("Unmuted autoplay failed, trying muted autoplay");
                try {
                  // If unmuted fails, try muted autoplay (more likely to succeed due to browser policies)
                  video.muted = true;
                  await video.play();
                } catch (err2) {
                  console.error('Both autoplay attempts failed:', err2);
                  setError('Autoplay blocked by browser. Please click to play.');
                }
              }
            };
            
            attemptAutoplay();
          });
          
          hlsInstance.on(Hls.Events.ERROR, (event, data) => {
            if (!isMounted) return;
            
            if (data.fatal) {
              switch(data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.error('Network error:', data);
                  setError('Network error loading stream. Attempting to recover...');
                  hlsInstance.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.error('Media error:', data);
                  setError('Media error. Attempting to recover...');
                  hlsInstance.recoverMediaError();
                  break;
                default:
                  console.error('Fatal error:', data);
                  setError('Failed to load stream. Please try again later.');
                  if (hlsInstance && isMounted) {
                    hlsInstance.destroy();
                    hlsRef.current = null;
                  }
                  break;
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Native HLS support (Safari)
          video.src = streamUrl;
          
          const handleMetadata = () => {
            if (!isMounted) return;
            setIsLoading(false);
            
            // Attempt autoplay with both muted and unmuted options for Safari
            const attemptAutoplay = async () => {
              try {
                // First try unmuted autoplay
                await video.play();
              } catch (err) {
                console.log("Unmuted autoplay failed in Safari, trying muted");
                try {
                  // If unmuted fails, try muted autoplay
                  video.muted = true;
                  await video.play();
                } catch (err2) {
                  console.error('Both autoplay attempts failed in Safari:', err2);
                  setError('Autoplay blocked by browser. Please click to play.');
                }
              }
            };
            
            attemptAutoplay();
          };
          
          const handleError = () => {
            if (!isMounted) return;
            setError('Failed to load stream. Please try again later.');
          };
          
          video.addEventListener('loadedmetadata', handleMetadata);
          video.addEventListener('error', handleError);
          
          // Return cleanup for this branch
          return () => {
            video.removeEventListener('loadedmetadata', handleMetadata);
            video.removeEventListener('error', handleError);
            video.src = '';
            video.load();
          };
        } else {
          if (isMounted) {
            setError('HLS is not supported in your browser.');
          }
        }
      } catch (error) {
        console.error('Error loading HLS.js:', error);
        if (isMounted) {
          setError('Error loading video player. Please make sure hls.js is installed.');
        }
      }
    };

    // Load HLS
    loadHls();

    // Cleanup function
    return () => {
      setIsMounted(false);
      
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      
      // Clean up video element
      if (videoRef.current) {
        videoRef.current.src = '';
        videoRef.current.load();
      }
    };
  }, [streamUrl]);

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play()
        .catch(err => console.error('Error on manual play:', err));
    }
  };

  const handleUnmuteClick = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
    }
  };

  return (
    <div className="mostart-card video-stream" style={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '94%',
      justifyContent: 'space-between'
    }}>
      <h2>LIVE STREAM</h2>
      <div className="stream-container" style={{ 
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        minHeight: '200px',
        marginTop: '10px',
        marginBottom: '10px'
      }}>
        {isLoading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white'
          }}>
            Loading stream...
          </div>
        )}
        {error && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '1rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <p>{error}</p>
              <button 
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f99a41',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '0.5rem'
                }}
                onClick={handlePlayClick}
              >
                Play Video
              </button>
              {videoRef.current?.muted && (
                <button 
                  style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#3f5a80',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={handleUnmuteClick}
                >
                  Unmute
                </button>
              )}
            </div>
          </div>
        )}
        <video
          ref={videoRef}
          style={{ 
            width: '100%', 
            height: 'auto', 
            maxHeight: '100%',
            objectFit: 'contain',
            display: 'block'
          }}
          controls
          playsInline
          autoPlay
        />
      </div>
    </div>
  );
};

export default HLSVideoPlayer;