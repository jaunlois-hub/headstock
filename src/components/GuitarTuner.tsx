import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type Tuning = {
  name: string;
  strings: Array<{ name: string; freq: number; label: string }>;
};

const tunings: Record<string, Tuning> = {
  standard: {
    name: "Standard (EADGBE)",
    strings: [
      { name: "E", freq: 82.41, label: "E (82 Hz)" },
      { name: "A", freq: 110.0, label: "A (110 Hz)" },
      { name: "D", freq: 146.83, label: "D (147 Hz)" },
      { name: "G", freq: 196.0, label: "G (196 Hz)" },
      { name: "B", freq: 246.94, label: "B (247 Hz)" },
      { name: "E4", freq: 329.63, label: "E (330 Hz)" },
    ],
  },
  dropD: {
    name: "Drop D (DADGBE)",
    strings: [
      { name: "D", freq: 73.42, label: "D (73 Hz)" },
      { name: "A", freq: 110.0, label: "A (110 Hz)" },
      { name: "D3", freq: 146.83, label: "D (147 Hz)" },
      { name: "G", freq: 196.0, label: "G (196 Hz)" },
      { name: "B", freq: 246.94, label: "B (247 Hz)" },
      { name: "E", freq: 329.63, label: "E (330 Hz)" },
    ],
  },
  dadgad: {
    name: "DADGAD",
    strings: [
      { name: "D", freq: 73.42, label: "D (73 Hz)" },
      { name: "A", freq: 110.0, label: "A (110 Hz)" },
      { name: "D3", freq: 146.83, label: "D (147 Hz)" },
      { name: "G", freq: 196.0, label: "G (196 Hz)" },
      { name: "A4", freq: 220.0, label: "A (220 Hz)" },
      { name: "D5", freq: 293.66, label: "D (294 Hz)" },
    ],
  },
  openG: {
    name: "Open G (DGDGBD)",
    strings: [
      { name: "D", freq: 73.42, label: "D (73 Hz)" },
      { name: "G2", freq: 98.0, label: "G (98 Hz)" },
      { name: "D3", freq: 146.83, label: "D (147 Hz)" },
      { name: "G", freq: 196.0, label: "G (196 Hz)" },
      { name: "B", freq: 246.94, label: "B (247 Hz)" },
      { name: "D5", freq: 293.66, label: "D (294 Hz)" },
    ],
  },
  halfStep: {
    name: "Half Step Down",
    strings: [
      { name: "Eb", freq: 77.78, label: "Eb (78 Hz)" },
      { name: "Ab", freq: 103.83, label: "Ab (104 Hz)" },
      { name: "Db", freq: 138.59, label: "Db (139 Hz)" },
      { name: "Gb", freq: 185.0, label: "Gb (185 Hz)" },
      { name: "Bb", freq: 233.08, label: "Bb (233 Hz)" },
      { name: "Eb4", freq: 311.13, label: "Eb (311 Hz)" },
    ],
  },
};

const GuitarTuner = () => {
  const [currentNote, setCurrentNote] = useState("–");
  const [isListening, setIsListening] = useState(false);
  const [selectedTuning, setSelectedTuning] = useState<string>("standard");
  const [isPolyphonic, setIsPolyphonic] = useState(false);
  const [stringStates, setStringStates] = useState<Record<string, { freq: number; state: "tuned" | "sharp" | "flat" | "inactive" }>>({});
  
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const currentStrings = tunings[selectedTuning].strings;
  const allPitches = Object.values(tunings).flatMap(t => 
    t.strings.map(s => ({ name: s.name, freq: s.freq }))
  );

  const playTone = (freq: number, noteName: string) => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = freq;
    gainNode.gain.value = 0.3;

    oscillator.connect(gainNode).connect(audioCtx.destination);
    oscillator.start();

    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1);
    oscillator.stop(audioCtx.currentTime + 1);

    setCurrentNote(noteName);
    setTimeout(() => setCurrentNote("–"), 1000);
  };

  const autoCorrelate = (buffer: Float32Array, sampleRate: number): number => {
    const SIZE = buffer.length;
    let rMax = 0;
    let rMaxLag = 0;

    for (let lag = 40; lag < SIZE / 2; lag++) {
      let sum = 0;
      for (let i = 0; i < SIZE - lag; i++) {
        sum += buffer[i] * buffer[i + lag];
      }
      if (sum > rMax) {
        rMax = sum;
        rMaxLag = lag;
      }
    }

    return rMax > 0.01 ? sampleRate / rMaxLag : -1;
  };

  const getTuningState = (freq: number, targetFreq: number): "tuned" | "sharp" | "flat" => {
    const cents = 1200 * Math.log2(freq / targetFreq);
    if (Math.abs(cents) < 5) return "tuned";
    return cents > 0 ? "sharp" : "flat";
  };

  const detectPitch = (analyser: AnalyserNode, sampleRate: number) => {
    const buffer = new Float32Array(analyser.fftSize);

    const loop = () => {
      analyser.getFloatTimeDomainData(buffer);
      const freq = autoCorrelate(buffer, sampleRate);

      if (freq > 0) {
        const closest = allPitches.reduce((a, b) =>
          Math.abs(b.freq - freq) < Math.abs(a.freq - freq) ? b : a
        );

        if (isPolyphonic) {
          // Update string states for polyphonic mode
          const newStates = { ...stringStates };
          currentStrings.forEach(string => {
            const diff = Math.abs(string.freq - freq);
            if (diff < 10) { // Within 10 Hz tolerance
              const state = getTuningState(freq, string.freq);
              newStates[string.name] = { freq, state };
            }
          });
          setStringStates(newStates);
          setCurrentNote(`${closest.name} (${freq.toFixed(1)} Hz)`);
        } else {
          // Single note mode
          setCurrentNote(`${closest.name} (${freq.toFixed(1)} Hz)`);
        }
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    loop();
  };

  const startMicTuner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);

      analyser.fftSize = 4096;
      source.connect(analyser);

      setIsListening(true);
      detectPitch(analyser, audioCtx.sampleRate);
      toast.success(isPolyphonic ? "Polyphonic tuner activated" : "Microphone tuner activated");
    } catch (err) {
      toast.error("Microphone access denied");
      console.error(err);
    }
  };

  const stopMicTuner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsListening(false);
    setCurrentNote("–");
    setStringStates({});
    toast.info("Microphone tuner stopped");
  };

  const handleTuningChange = (value: string) => {
    setSelectedTuning(value);
    setStringStates({});
    if (isListening) {
      stopMicTuner();
    }
    toast.success(`Switched to ${tunings[value].name}`);
  };

  return (
    <section id="tuner" className="px-4 md:px-12 py-16 md:py-24">
      <Card className="bg-card border-border p-8 md:p-12">
        <h2 className="text-3xl md:text-5xl font-bold mb-2 text-center">Guitar Tuner</h2>
        <p className="text-muted-foreground text-center mb-8">Tune your guitar with precision</p>
        
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 max-w-2xl mx-auto">
          <div className="flex-1">
            <Label className="text-sm font-medium mb-2 block">Tuning</Label>
            <Select value={selectedTuning} onValueChange={handleTuningChange}>
              <SelectTrigger className="w-full bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {Object.entries(tunings).map(([key, tuning]) => (
                  <SelectItem key={key} value={key} className="cursor-pointer">
                    {tuning.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 flex items-end">
            <Button
              onClick={() => {
                setIsPolyphonic(!isPolyphonic);
                setStringStates({});
                if (isListening) {
                  stopMicTuner();
                }
                toast.success(`${!isPolyphonic ? "Polyphonic" : "Single note"} mode activated`);
              }}
              variant="outline"
              className="w-full"
            >
              {isPolyphonic ? "Polyphonic Mode" : "Single Note Mode"}
            </Button>
          </div>
        </div>

        {/* Display */}
        {isPolyphonic && isListening ? (
          <div className="mb-8">
            <div className="text-center mb-6">
              <div className="text-4xl md:text-5xl font-bold text-primary min-h-[60px] flex items-center justify-center">
                {currentNote}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 max-w-4xl mx-auto">
              {currentStrings.map((string) => {
                const state = stringStates[string.name];
                const stateColor = state?.state === "tuned" 
                  ? "border-primary bg-primary/10 text-primary" 
                  : state?.state === "sharp"
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : state?.state === "flat"
                  ? "border-yellow-500 bg-yellow-500/10 text-yellow-500"
                  : "border-border bg-background text-muted-foreground";
                
                return (
                  <div
                    key={string.label}
                    className={`p-4 rounded-lg border-2 transition-all ${stateColor}`}
                  >
                    <div className="text-center">
                      <div className="text-xl font-bold">{string.name}</div>
                      <div className="text-xs opacity-75">{string.freq.toFixed(0)} Hz</div>
                      {state && (
                        <div className="text-xs mt-1 font-semibold">
                          {state.state === "tuned" ? "✓" : state.state === "sharp" ? "↑" : "↓"}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-5xl md:text-7xl font-bold mb-8 text-primary min-h-[100px] flex items-center justify-center">
            {currentNote}
          </div>
        )}

        {/* Reference Tones */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {currentStrings.map((string) => (
            <Button
              key={string.label}
              variant="secondary"
              onClick={() => playTone(string.freq, string.name)}
              className="font-medium hover:bg-secondary/80"
            >
              {string.label}
            </Button>
          ))}
        </div>

        {/* Mic Button */}
        <div className="text-center">
          <Button
            onClick={isListening ? stopMicTuner : startMicTuner}
            size="lg"
            variant={isListening ? "destructive" : "default"}
            className={`font-bold ${isListening ? "" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
          >
            {isListening ? (
              <>
                <MicOff className="mr-2 h-5 w-5" />
                Stop microphone
              </>
            ) : (
              <>
                <Mic className="mr-2 h-5 w-5" />
                Use microphone
              </>
            )}
          </Button>
        </div>
      </Card>
    </section>
  );
};

export default GuitarTuner;
