"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Video, Square, RefreshCcw, Check, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';

export default function VideoMessagePage() {
  const { slug } = useParams();
  const router = useRouter();
  const webcamRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<BlobPart[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Camera access denied');
    }
  };

  React.useEffect(() => {
    startCamera();
    return () => {
      if (webcamRef.current?.srcObject) {
        const stream = webcamRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleDataAvailable = useCallback(
    ({ data }: BlobEvent) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  const startRecording = useCallback(() => {
    if (!webcamRef.current?.srcObject) return;
    
    setIsRecording(true);
    setTimeLeft(30);
    setRecordedChunks([]);
    
    const stream = webcamRef.current.srcObject as MediaStream;
    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorderRef.current.addEventListener('dataavailable', handleDataAvailable);
    mediaRecorderRef.current.start();

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // store timer to clear if stopped early
    (window as any).recordingTimer = timer;
  }, [handleDataAvailable]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    clearInterval((window as any).recordingTimer);
  }, []);

  React.useEffect(() => {
    if (!isRecording && recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    }
  }, [isRecording, recordedChunks]);

  const uploadVideo = async () => {
    if (!recordedChunks.length) return;
    setIsUploading(true);
    try {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const fileName = `msg_${Date.now()}.webm`;
      
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(`${slug}/${fileName}`, blob, { contentType: 'video/webm' });
        
      if (uploadError) throw uploadError;

      alert('Message sent successfully!');
      router.push(`/mobile/${slug}`);
    } catch (err) {
      alert('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col">
      <div className="p-4 flex justify-between items-center z-50 absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={() => router.back()} className="p-2"><X /></button>
        <div className="font-bold">Leave a Message</div>
        <div className="w-8" />
      </div>

      <div className="flex-1 relative bg-zinc-900">
        {!videoUrl ? (
          <video 
            ref={webcamRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover scale-x-[-1]"
          />
        ) : (
          <video 
            src={videoUrl} 
            controls 
            playsInline 
            className="w-full h-full object-cover"
          />
        )}
        
        {isRecording && (
          <div className="absolute top-20 right-6 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full" /> {timeLeft}s
          </div>
        )}
      </div>

      <div className="h-32 bg-black flex items-center justify-center gap-8 pb-8">
        {!videoUrl ? (
          isRecording ? (
            <button onClick={stopRecording} className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)]">
              <Square size={24} fill="currentColor" />
            </button>
          ) : (
            <button onClick={startRecording} className="w-20 h-20 border-4 border-white rounded-full flex items-center justify-center">
              <div className="w-16 h-16 bg-red-500 rounded-full" />
            </button>
          )
        ) : (
          <>
            <button 
              onClick={() => { setVideoUrl(null); setRecordedChunks([]); }}
              className="px-6 py-3 bg-white/10 rounded-full font-bold flex items-center gap-2"
            >
              <RefreshCcw size={18} /> Retake
            </button>
            <button 
              onClick={uploadVideo}
              disabled={isUploading}
              className="px-6 py-3 bg-primary rounded-full font-bold flex items-center gap-2"
            >
              {isUploading ? 'Uploading...' : <><Check size={18} /> Send</>}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
