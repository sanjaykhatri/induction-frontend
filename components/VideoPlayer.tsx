'use client';

import { useEffect, useRef, useState } from 'react';
import { videoCompletionApi } from '@/lib/api';

interface VideoPlayerProps {
  videoUrl: string;
  chapterId: number;
  submissionId: number;
  onComplete?: () => void;
  disabled?: boolean;
}

export default function VideoPlayer({
  videoUrl,
  chapterId,
  submissionId,
  onComplete,
  disabled = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const progressUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      if (video.duration) {
        const currentProgress = (video.currentTime / video.duration) * 100;
        setProgress(currentProgress);
        const currentWatchedSeconds = Math.floor(video.currentTime);
        setWatchedSeconds(currentWatchedSeconds);

        // Update progress on backend every 5 seconds (only if video is actually playing)
        // Don't call API if video hasn't started playing yet
        if (currentWatchedSeconds > 0 && currentWatchedSeconds % 5 === 0 && !isCompleted) {
          updateProgress(currentProgress, currentWatchedSeconds);
        }
      }
    };

    const handleEnded = () => {
      markAsCompleted();
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    // Disable controls if disabled prop is true
    if (disabled) {
      video.controls = false;
      video.addEventListener('contextmenu', (e) => e.preventDefault());
      video.addEventListener('keydown', (e) => {
        if (['Space', 'ArrowLeft', 'ArrowRight', 'KeyF'].includes(e.code)) {
          e.preventDefault();
        }
      });
    }

    // Check if already completed
    checkCompletion();

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      if (progressUpdateInterval.current) {
        clearInterval(progressUpdateInterval.current);
      }
    };
  }, [videoUrl, chapterId, submissionId, disabled]);

  const checkCompletion = async () => {
    try {
      const result = await videoCompletionApi.checkCompletion(chapterId, submissionId) as {
        is_completed: boolean;
        watched_seconds?: number;
      };
      if (result.is_completed) {
        setIsCompleted(true);
        setProgress(100);
        setWatchedSeconds(result.watched_seconds || 0);
        // Don't seek to end automatically - let user see the video if they want
        // if (videoRef.current && videoRef.current.duration) {
        //   videoRef.current.currentTime = videoRef.current.duration;
        // }
      }
    } catch (error) {
      console.error('Failed to check completion:', error);
      // If check fails, assume not completed
      setIsCompleted(false);
    }
  };

  const updateProgress = async (progressPercentage: number, watched: number) => {
    // Only update if video has actually been watched (not just loaded)
    if (watched <= 0 || isCompleted) return;
    
    try {
      await videoCompletionApi.updateProgress(chapterId, {
        submission_id: submissionId,
        progress_percentage: progressPercentage,
        watched_seconds: watched,
        total_seconds: duration || undefined,
      });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const markAsCompleted = async () => {
    if (isCompleted) return;

    try {
      await videoCompletionApi.markCompleted(chapterId, {
        submission_id: submissionId,
        total_seconds: duration || undefined,
      });
      setIsCompleted(true);
      setProgress(100);
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Failed to mark as completed:', error);
    }
  };

  // Prevent skipping forward - only allow seeking to already watched portions
  const handleSeeking = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (!isCompleted && watchedSeconds > 0) {
      // Prevent seeking forward beyond what's been watched
      const currentTime = video.currentTime;
      const maxAllowedTime = watchedSeconds;
      
      // Only prevent if trying to skip forward significantly (more than 2 seconds ahead)
      if (currentTime > maxAllowedTime + 2) {
        video.currentTime = maxAllowedTime;
      }
    }
  };
  
  // Prevent right-click context menu
  const handleContextMenu = (e: React.MouseEvent<HTMLVideoElement>) => {
    e.preventDefault();
  };

  return (
    <div className="w-full">
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full"
          onSeeking={handleSeeking}
          onContextMenu={handleContextMenu}
          playsInline
          controls={true}
          preload="metadata"
          controlsList="nodownload nofullscreen noremoteplayback"
        />
        {disabled && !isCompleted && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black bg-opacity-30">
            <p className="text-white text-lg font-semibold">
              Please watch the entire video to continue
            </p>
          </div>
        )}
      </div>
      
      {!isCompleted && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-foreground-secondary">Progress</span>
            <span className="text-sm text-foreground-secondary">
              {Math.round(progress)}% ({Math.floor(watchedSeconds / 60)}:{(watchedSeconds % 60).toString().padStart(2, '0')})
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {isCompleted && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">✓ Video completed! You can now proceed to the questions.</p>
        </div>
      )}
    </div>
  );
}

