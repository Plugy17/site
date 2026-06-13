import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useI18n } from '../i18n';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, MonitorUp } from 'lucide-react';

export default function VideoCallPage() {
  const [params] = useSearchParams();
  const { t } = useI18n();
  const roomName = params.get('room') || 'default-room';
  const containerRef = useRef<HTMLDivElement>(null);
  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  useEffect(() => {
    if (!joined || !containerRef.current) return;
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => {
      const win = window as any;
      if (!win.JitsiMeetExternalAPI || !containerRef.current) return;
      const api = new win.JitsiMeetExternalAPI('meet.jit.si', {
        roomName: `learnflow-${roomName}`,
        parentNode: containerRef.current,
        configOverwrite: { startWithAudioMuted: muted, startWithVideoMuted: cameraOff, prejoinPageEnabled: false },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: ['microphone', 'camera', 'hangup', 'chat', 'raiseHand', 'tileView'],
          SHOW_JITSI_WATERMARK: false, SHOW_WATERMARK_FOR_GUESTS: false,
        },
        width: '100%', height: '100%',
      });
      (window as any)._jitsiApi = api;
    };
    document.body.appendChild(script);
    return () => { const api = (window as any)._jitsiApi; if (api) api.dispose(); if (script.parentNode) script.parentNode.removeChild(script); };
  }, [joined, roomName]);

  if (!joined) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6"><MonitorUp className="w-10 h-10 text-emerald-600 dark:text-emerald-400" /></div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('video.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">{t('video.subtitle')}</p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 inline-block">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setMuted(!muted)} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${muted ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
              {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button onClick={() => setCameraOff(!cameraOff)} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${cameraOff ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
              {cameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mb-6">
            <Mic className={`w-3.5 h-3.5 ${muted ? 'text-red-400 dark:text-red-400' : 'text-green-400 dark:text-green-400'}`} /><span>{muted ? t('video.muted') : t('video.micOn')}</span>
            <Video className={`w-3.5 h-3.5 ${cameraOff ? 'text-red-400 dark:text-red-400' : 'text-green-400 dark:text-green-400'}`} /><span>{cameraOff ? t('video.cameraOff') : t('video.cameraOn')}</span>
          </div>
          <button onClick={() => setJoined(true)} className="flex items-center gap-2 mx-auto bg-emerald-600 dark:bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 dark:hover:bg-emerald-700 transition-colors">
            <Phone className="w-5 h-5" /> {t('video.joinCall')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-900 dark:bg-gray-950 relative">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-gray-800/90 dark:bg-gray-950/90 backdrop-blur-sm rounded-2xl px-4 py-3">
        <button onClick={() => setMuted(!muted)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${muted ? 'bg-red-500 text-white' : 'bg-gray-700 dark:bg-gray-800 text-gray-300 dark:text-gray-300 hover:bg-gray-600 dark:hover:bg-gray-700'}`}>
          {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
        <button onClick={() => setCameraOff(!cameraOff)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${cameraOff ? 'bg-red-500 text-white' : 'bg-gray-700 dark:bg-gray-800 text-gray-300 dark:text-gray-300 hover:bg-gray-600 dark:hover:bg-gray-700'}`}>
          {cameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
        </button>
        <button onClick={() => setJoined(false)} className="w-10 h-10 bg-red-500 dark:bg-red-600 rounded-xl flex items-center justify-center text-white hover:bg-red-600 dark:hover:bg-red-700 transition-colors">
          <PhoneOff className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
