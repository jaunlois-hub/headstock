import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Music, Loader2, BarChart3, Activity, Circle, Palette 
} from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  frequency: number;
  pattern: "steady" | "arpeggio" | "chord" | "scale" | "rhythm";
}

type VisualizerMode = "bars" | "oscilloscope" | "circular";
type VisualizerTheme = "classic" | "neon" | "fire" | "ocean" | "monochrome";

const visualizerThemes: Record<VisualizerTheme, { primary: string; secondary: string; bg: string }> = {
  classic: { primary: "255, 255, 255", secondary: "200, 200, 200", bg: "0, 0, 0" },
  neon: { primary: "0, 255, 136", secondary: "255, 0, 255", bg: "10, 10, 30" },
  fire: { primary: "255, 100, 0", secondary: "255, 200, 0", bg: "20, 5, 0" },
  ocean: { primary: "0, 150, 255", secondary: "0, 255, 200", bg: "0, 20, 40" },
  monochrome: { primary: "255, 255, 255", secondary: "128, 128, 128", bg: "0, 0, 0" },
};

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
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>("bars");
  const [visualizerTheme, setVisualizerTheme] = useState<VisualizerTheme>("classic");
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const circularCanvasRef = useRef<HTMLCanvasElement | null>(null);
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
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 512;
      analyserRef.current.connect(audioContextRef.current.destination);
    }
    return audioContextRef.current;
  }, []);

  const getThemeColors = useCallback(() => {
    return visualizerThemes[visualizerTheme];
  }, [visualizerTheme]);

  // Bar visualizer
  const drawBars = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, dataArray: Uint8Array, bufferLength: number) => {
    const theme = getThemeColors();
    
    ctx.fillStyle = `rgb(${theme.bg})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
      
      const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
      gradient.addColorStop(0, `rgba(${theme.primary}, 1)`);
      gradient.addColorStop(1, `rgba(${theme.secondary}, 0.5)`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
      
      x += barWidth + 1;
    }
  }, [getThemeColors]);

  // Oscilloscope visualizer
  const drawOscilloscope = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, analyser: AnalyserNode) => {
    const theme = getThemeColors();
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);
    
    ctx.fillStyle = `rgb(${theme.bg})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.lineWidth = 2;
    ctx.strokeStyle = `rgb(${theme.primary})`;
    ctx.beginPath();
    
    const sliceWidth = canvas.width / bufferLength;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      x += sliceWidth;
    }
    
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    
    // Add glow effect
    ctx.shadowColor = `rgb(${theme.primary})`;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [getThemeColors]);

  // Circular visualizer
  const drawCircular = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, dataArray: Uint8Array, bufferLength: number) => {
    const theme = getThemeColors();
    
    ctx.fillStyle = `rgba(${theme.bg}, 0.1)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.4;
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${theme.primary}, 0.3)`;
    ctx.fill();
    
    // Draw frequency bars in a circle
    const bars = 64;
    const step = Math.floor(bufferLength / bars);
    
    for (let i = 0; i < bars; i++) {
      const amplitude = dataArray[i * step] / 255;
      const barHeight = amplitude * radius * 1.5;
      const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
      
      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + barHeight);
      const y2 = centerY + Math.sin(angle) * (radius + barHeight);
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = 3;
      
      // Gradient color based on amplitude
      const hue = (i / bars) * 60 + (visualizerTheme === 'fire' ? 0 : visualizerTheme === 'ocean' ? 180 : visualizerTheme === 'neon' ? 120 : 0);
      ctx.strokeStyle = visualizerTheme === 'monochrome' || visualizerTheme === 'classic' 
        ? `rgba(${theme.primary}, ${0.5 + amplitude * 0.5})`
        : `hsla(${hue}, 100%, ${50 + amplitude * 30}%, ${0.5 + amplitude * 0.5})`;
      
      ctx.stroke();
    }
    
    // Inner glow
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${theme.primary}, 0.5)`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [getThemeColors, visualizerTheme]);

  const drawWaveform = useCallback(() => {
    const canvas = visualizerMode === 'circular' ? circularCanvasRef.current : canvasRef.current;
    if (!canvas || !analyserRef.current) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      switch (visualizerMode) {
        case 'bars':
          drawBars(ctx, canvas, dataArray, bufferLength);
          break;
        case 'oscilloscope':
          drawOscilloscope(ctx, canvas, analyser);
          break;
        case 'circular':
          drawCircular(ctx, canvas, dataArray, bufferLength);
          break;
      }
    };

    draw();
  }, [visualizerMode, drawBars, drawOscilloscope, drawCircular]);

  const stopWaveform = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    const theme = getThemeColors();
    [canvasRef.current, circularCanvasRef.current].forEach(canvas => {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = `rgb(${theme.bg})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    });
  }, [getThemeColors]);

  // Restart visualizer when mode or theme changes
  useEffect(() => {
    if (isPlaying && analyserRef.current) {
      stopWaveform();
      drawWaveform();
    }
  }, [visualizerMode, visualizerTheme, isPlaying, drawWaveform, stopWaveform]);

  const playPattern = useCallback((track: Track) => {
    const ctx = createAudioContext();
    stopAudio();

    gainNodeRef.current = ctx.createGain();
    gainNodeRef.current.connect(analyserRef.current!);
    gainNodeRef.current.gain.value = (isMuted ? 0 : volume) / 100 * 0.3;
    
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

  const themeLabels: Record<VisualizerTheme, string> = {
    classic: "Classic",
    neon: "Neon",
    fire: "Fire",
    ocean: "Ocean",
    monochrome: "Mono",
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

        {/* Visualizer Mode & Theme Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Mode:</span>
            <div className="flex gap-1">
              <Button
                variant={visualizerMode === 'bars' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVisualizerMode('bars')}
                className="h-8 px-3"
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
              <Button
                variant={visualizerMode === 'oscilloscope' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVisualizerMode('oscilloscope')}
                className="h-8 px-3"
              >
                <Activity className="w-4 h-4" />
              </Button>
              <Button
                variant={visualizerMode === 'circular' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVisualizerMode('circular')}
                className="h-8 px-3"
              >
                <Circle className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-1">
              {(Object.keys(visualizerThemes) as VisualizerTheme[]).map((theme) => (
                <Button
                  key={theme}
                  variant={visualizerTheme === theme ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setVisualizerTheme(theme)}
                  className="h-7 px-2 text-xs"
                >
                  {themeLabels[theme]}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Waveform Visualizer (Bars & Oscilloscope) */}
        {visualizerMode !== 'circular' && (
          <div className="mb-4 rounded-lg overflow-hidden border border-border">
            <canvas
              ref={canvasRef}
              width={800}
              height={120}
              className="w-full h-28"
            />
          </div>
        )}

        {/* Circular Visualizer */}
        {visualizerMode === 'circular' && (
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <canvas
                ref={circularCanvasRef}
                width={280}
                height={280}
                className="rounded-full border border-border"
              />
              {/* Play button overlay in center */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Button
                  onClick={handlePlayPause}
                  disabled={isLoading}
                  className="h-16 w-16 rounded-full bg-primary/90 hover:bg-primary pointer-events-auto shadow-lg"
                >
                  {isLoading ? (
                    <Loader2 className="h-7 w-7 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="h-7 w-7" />
                  ) : (
                    <Play className="h-7 w-7 ml-1" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

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

        {/* Controls (hidden when circular mode - button is in center) */}
        {visualizerMode !== 'circular' && (
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
        )}

        {/* Skip buttons for circular mode */}
        {visualizerMode === 'circular' && (
          <div className="flex items-center justify-center gap-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="h-10 w-10"
            >
              <SkipBack className="h-5 w-5" />
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
        )}

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
