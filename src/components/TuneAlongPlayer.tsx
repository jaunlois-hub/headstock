import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music } from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
}

const sampleTracks: Track[] = [
  { id: "1", title: "Standard Tuning Practice", artist: "Headstock Studio", duration: 180 },
  { id: "2", title: "Drop D Warm-up", artist: "Headstock Studio", duration: 240 },
  { id: "3", title: "Fingerpicking Pattern", artist: "Headstock Studio", duration: 200 },
  { id: "4", title: "Blues Scale Practice", artist: "Headstock Studio", duration: 220 },
  { id: "5", title: "Chord Progression Loop", artist: "Headstock Studio", duration: 160 },
];

const TuneAlongPlayer = () => {
  const [currentTrack, setCurrentTrack] = useState<Track>(sampleTracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentTrack.duration) {
            handleNext();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, currentTrack]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    const currentIndex = sampleTracks.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? sampleTracks.length - 1 : currentIndex - 1;
    setCurrentTrack(sampleTracks[prevIndex]);
    setCurrentTime(0);
  };

  const handleNext = () => {
    const currentIndex = sampleTracks.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % sampleTracks.length;
    setCurrentTrack(sampleTracks[nextIndex]);
    setCurrentTime(0);
  };

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(value[0] === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const selectTrack = (track: Track) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Now Playing */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
            <Music className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{currentTrack.title}</h3>
            <p className="text-muted-foreground text-sm">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            max={currentTrack.duration}
            step={1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(currentTrack.duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            className="h-10 w-10"
          >
            <SkipBack className="h-5 w-5" />
          </Button>
          <Button
            onClick={handlePlayPause}
            className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-0.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="h-10 w-10"
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        {/* Volume */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="h-8 w-8"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            className="w-24 cursor-pointer"
          />
        </div>
      </div>

      {/* Playlist */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h4 className="font-semibold uppercase tracking-wider text-sm">Practice Tracks</h4>
        </div>
        <div className="divide-y divide-border">
          {sampleTracks.map((track, index) => (
            <button
              key={track.id}
              onClick={() => selectTrack(track)}
              className={`w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left ${
                currentTrack.id === track.id ? "bg-primary/5" : ""
              }`}
            >
              <span className="text-muted-foreground text-sm w-6">{index + 1}</span>
              <div className="flex-1 min-w-0">
                <p className={`truncate ${currentTrack.id === track.id ? "text-primary font-medium" : ""}`}>
                  {track.title}
                </p>
                <p className="text-muted-foreground text-sm truncate">{track.artist}</p>
              </div>
              <span className="text-muted-foreground text-sm">{formatTime(track.duration)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TuneAlongPlayer;
