import React, { useEffect, useRef, useState, useCallback } from 'react';

const HLSVideoPlayer = ({ streamUrl }) => {
    const videoRef = useRef(null);
    const hlsRef = useRef(null);
    const scriptRef = useRef(null);
    const [error, setError] = useState(null);

    const initPlayer = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        if (hlsRef.current) {
            hlsRef.current.destroy();
        }

        let fullUrl = streamUrl;
        if (!streamUrl.endsWith('.m3u8')) {
            fullUrl = `${streamUrl}${streamUrl.endsWith('/') ? '' : '/'}stream.m3u8`;
        }

        if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls();
            hlsRef.current = hls;

            hls.loadSource(fullUrl);
            hls.attachMedia(video);

            hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(e => console.warn('Autoplay prevented:', e));
            });

            hls.on(window.Hls.Events.ERROR, (event, data) => {
                console.error('HLS error:', data);
                if (data.fatal) {
                    switch (data.type) {
                        case window.Hls.ErrorTypes.NETWORK_ERROR:
                            hls.startLoad();
                            break;
                        case window.Hls.ErrorTypes.MEDIA_ERROR:
                            hls.recoverMediaError();
                            break;
                        default:
                            hls.destroy();
                            setError(`Stream error: ${data.details}`);
                            break;
                    }
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = fullUrl;
            video.addEventListener('loadedmetadata', () => {
                video.play().catch(e => console.warn('Autoplay prevented:', e));
            });
        } else {
            setError('Your browser does not support HLS streaming');
        }
    }, [streamUrl]);

    useEffect(() => {
        if (window.Hls) {
            initPlayer();
        } else {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
            script.async = true;
            script.onload = initPlayer;
            document.body.appendChild(script);
            scriptRef.current = script;
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }
            if (scriptRef.current) {
                document.body.removeChild(scriptRef.current);
            }
        };
    }, [initPlayer]);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <video
                ref={videoRef}
                controls
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {error && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '20px',
                    textAlign: 'center'
                }}>
                    <div>
                        <p style={{ marginBottom: '10px' }}>⚠️ Error loading video stream</p>
                        <p style={{ fontSize: '14px' }}>{error}</p>
                        <button
                            onClick={() => {
                                setError(null);
                                setTimeout(() => initPlayer(), 100);
                            }}
                            style={{
                                marginTop: '10px',
                                padding: '8px 16px',
                                backgroundColor: '#f99a41',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HLSVideoPlayer;
