import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, Loader2 } from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  frequency: number;
  pattern: "steady" | "arpeggio" | "chord" | "scale" | "rhythm";
}

const sampleTracks: Track[] = [
  { id: "1", title: "Standard Tuning Practice", artist: "Headstock Studio", duration: 30, frequency: 329.63, pattern: "steady" },
  { id: "2", title: "Drop D Warm-up", artist: "Headstock Studio", duration: 30, frequency: 293.66, pattern: "arpeggio" },
  { id: "3", title: "Fingerpicking Pattern", artist: "Headstock Studio", duration: 30, frequency: 196.00, pattern: "chord" },
  { id: "4", title: "Blues Scale Practice", artist: "Headstock Studio", duration: 30, frequency: 440.00, pattern: "scale" },
  { id: "5", title: "Chord Progression Loop", artist: "Headstock Studio", duration: 30, frequency: 261.63, pattern: "rhythm" },
];

const TuneAlongPlayer = () => {
  const [currentTrack, setCurrentTrack] = useState<Track>(sampleTracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const patternIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopAudio = useCallback(() => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch (e) {
        // Oscillator already stopped
      }
      oscillatorRef.current = null;
    }
    if (patternIntervalRef.current) {
      clearInterval(patternIntervalRef.current);
      patternIntervalRef.current = null;
    }
  }, []);

  const createAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Create analyser node
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.connect(audioContextRef.current.destination);
    }
    return audioContextRef.current;
  }, []);

  // Waveform visualizer drawing
  const drawWaveform = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      ctx.fillStyle = 'hsl(var(--card))';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
        
        // Create gradient effect
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, 'hsl(var(--primary))');
        gradient.addColorStop(1, 'hsl(var(--primary) / 0.3)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        
        x += barWidth + 1;
      }
    };

    draw();
  }, []);

  const stopWaveform = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'hsl(var(--card))';
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, []);

  const playPattern = useCallback((track: Track) => {
    const ctx = createAudioContext();
    stopAudio();

    gainNodeRef.current = ctx.createGain();
    // Connect to analyser instead of directly to destination
    gainNodeRef.current.connect(analyserRef.current!);
    gainNodeRef.current.gain.value = (isMuted ? 0 : volume) / 100 * 0.3;
    
    // Start waveform visualization
    drawWaveform();

    const playNote = (freq: number, duration: number = 0.5, delay: number = 0) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      
      osc.connect(noteGain);
      noteGain.connect(gainNodeRef.current!);
      
      osc.frequency.value = freq;
      osc.type = track.pattern === "rhythm" ? "square" : "sine";
      
      const startTime = ctx.currentTime + delay;
      noteGain.gain.setValueAtTime(0, startTime);
      noteGain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      noteGain.gain.linearRampToValueAtTime(0, startTime + duration);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const baseFreq = track.frequency;
    
    switch (track.pattern) {
      case "steady":
        oscillatorRef.current = ctx.createOscillator();
        oscillatorRef.current.connect(gainNodeRef.current);
        oscillatorRef.current.frequency.value = baseFreq;
        oscillatorRef.current.type = "sine";
        oscillatorRef.current.start();
        break;
        
      case "arpeggio":
        const arpeggioNotes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2];
        let arpeggioIndex = 0;
        playNote(arpeggioNotes[arpeggioIndex], 0.4);
        patternIntervalRef.current = setInterval(() => {
          arpeggioIndex = (arpeggioIndex + 1) % arpeggioNotes.length;
          playNote(arpeggioNotes[arpeggioIndex], 0.4);
        }, 500);
        break;
        
      case "chord":
        playNote(baseFreq, 2);
        playNote(baseFreq * 1.25, 2);
        playNote(baseFreq * 1.5, 2);
        patternIntervalRef.current = setInterval(() => {
          playNote(baseFreq, 2);
          playNote(baseFreq * 1.25, 2);
          playNote(baseFreq * 1.5, 2);
        }, 2500);
        break;
        
      case "scale":
        const scaleNotes = [baseFreq, baseFreq * 9/8, baseFreq * 5/4, baseFreq * 4/3, baseFreq * 3/2, baseFreq * 5/3, baseFreq * 15/8, baseFreq * 2];
        let scaleIndex = 0;
        let ascending = true;
        playNote(scaleNotes[scaleIndex], 0.3);
        patternIntervalRef.current = setInterval(() => {
          if (ascending) {
            scaleIndex++;
            if (scaleIndex >= scaleNotes.length - 1) ascending = false;
          } else {
            scaleIndex--;
            if (scaleIndex <= 0) ascending = true;
          }
          playNote(scaleNotes[scaleIndex], 0.3);
        }, 400);
        break;
        
      case "rhythm":
        const rhythmPattern = [1, 0, 1, 0, 1, 1, 0, 1];
        let rhythmIndex = 0;
        if (rhythmPattern[rhythmIndex]) playNote(baseFreq, 0.15);
        patternIntervalRef.current = setInterval(() => {
          rhythmIndex = (rhythmIndex + 1) % rhythmPattern.length;
          if (rhythmPattern[rhythmIndex]) playNote(baseFreq, 0.15);
        }, 250);
        break;
    }
  }, [volume, isMuted, createAudioContext, stopAudio, drawWaveform]);

  const handlePlayPause = useCallback(async () => {
    if (isPlaying) {
      stopAudio();
      stopWaveform();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      try {
        const ctx = createAudioContext();
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        playPattern(currentTrack);
        setIsPlaying(true);
      } catch (e) {
        console.error("Audio playback failed:", e);
      }
      setIsLoading(false);
    }
  }, [isPlaying, currentTrack, playPattern, stopAudio, stopWaveform, createAudioContext]);

  const handleNext = useCallback(() => {
    const currentIndex = sampleTracks.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % sampleTracks.length;
    const nextTrack = sampleTracks[nextIndex];
    setCurrentTrack(nextTrack);
    setCurrentTime(0);
    if (isPlaying) {
      stopAudio();
      setTimeout(() => playPattern(nextTrack), 100);
    }
  }, [currentTrack, isPlaying, playPattern, stopAudio]);

  const handlePrevious = useCallback(() => {
    const currentIndex = sampleTracks.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? sampleTracks.length - 1 : currentIndex - 1;
    const prevTrack = sampleTracks[prevIndex];
    setCurrentTrack(prevTrack);
    setCurrentTime(0);
    if (isPlaying) {
      stopAudio();
      setTimeout(() => playPattern(prevTrack), 100);
    }
  }, [currentTrack, isPlaying, playPattern, stopAudio]);

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
  }, [isPlaying, currentTrack.duration, handleNext]);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = (isMuted ? 0 : volume) / 100 * 0.3;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    return () => {
      stopAudio();
      stopWaveform();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAudio, stopWaveform]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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

  const selectTrack = async (track: Track) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    stopAudio();
    
    setIsLoading(true);
    try {
      const ctx = createAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      setTimeout(() => {
        playPattern(track);
        setIsPlaying(true);
        setIsLoading(false);
      }, 100);
    } catch (e) {
      console.error("Audio playback failed:", e);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Now Playing */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center relative">
            <Music className={`w-8 h-8 text-primary ${isPlaying ? 'animate-pulse' : ''}`} />
            {isPlaying && (
              <div className="absolute inset-0 rounded-lg border-2 border-primary/30 animate-ping" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{currentTrack.title}</h3>
            <p className="text-muted-foreground text-sm">{currentTrack.artist}</p>
            <p className="text-xs text-primary/70 capitalize mt-1">Pattern: {currentTrack.pattern}</p>
          </div>
        </div>

        {/* Waveform Visualizer */}
        <div className="mb-4 rounded-lg overflow-hidden border border-border bg-card">
          <canvas
            ref={canvasRef}
            width={800}
            height={100}
            className="w-full h-24"
          />
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
            disabled={isLoading}
            className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : isPlaying ? (
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
          <p className="text-xs text-muted-foreground mt-1">Click to play synthesized guitar practice patterns</p>
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
              <span className="text-xs text-muted-foreground capitalize px-2 py-1 bg-muted rounded">
                {track.pattern}
              </span>
              <span className="text-muted-foreground text-sm">{formatTime(track.duration)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TuneAlongPlayer;
