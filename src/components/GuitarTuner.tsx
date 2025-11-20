import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TuningState = "tuned" | "sharp" | "flat";

type Tuning = {
  name: string;
  strings: Array<{ name: string; freq: number; label: string }>;
};

const tunings: Record<string, Tuning> = {
  standard: {
    name: "Standard (EADGBE)",
    strings: [
      { name: "E", freq: 82.41, label: "6th String" },
      { name: "A", freq: 110.0, label: "5th String" },
      { name: "D", freq: 146.83, label: "4th String" },
      { name: "G", freq: 196.0, label: "3rd String" },
      { name: "B", freq: 246.94, label: "2nd String" },
      { name: "E4", freq: 329.63, label: "1st String" },
    ],
  },
  dropD: {
    name: "Drop D (DADGBE)",
    strings: [
      { name: "D", freq: 73.42, label: "6th String" },
      { name: "A", freq: 110.0, label: "5th String" },
      { name: "D3", freq: 146.83, label: "4th String" },
      { name: "G", freq: 196.0, label: "3rd String" },
      { name: "B", freq: 246.94, label: "2nd String" },
      { name: "E", freq: 329.63, label: "1st String" },
    ],
  },
  dadgad: {
    name: "DADGAD",
    strings: [
      { name: "D", freq: 73.42, label: "6th String" },
      { name: "A", freq: 110.0, label: "5th String" },
      { name: "D3", freq: 146.83, label: "4th String" },
      { name: "G", freq: 196.0, label: "3rd String" },
      { name: "A4", freq: 220.0, label: "2nd String" },
      { name: "D5", freq: 293.66, label: "1st String" },
    ],
  },
  openG: {
    name: "Open G (DGDGBD)",
    strings: [
      { name: "D", freq: 73.42, label: "6th String" },
      { name: "G2", freq: 98.0, label: "5th String" },
      { name: "D3", freq: 146.83, label: "4th String" },
      { name: "G", freq: 196.0, label: "3rd String" },
      { name: "B", freq: 246.94, label: "2nd String" },
      { name: "D5", freq: 293.66, label: "1st String" },
    ],
  },
  halfStep: {
    name: "Half Step Down",
    strings: [
      { name: "Eb", freq: 77.78, label: "6th String" },
      { name: "Ab", freq: 103.83, label: "5th String" },
      { name: "Db", freq: 138.59, label: "4th String" },
      { name: "Gb", freq: 185.0, label: "3rd String" },
      { name: "Bb", freq: 233.08, label: "2nd String" },
      { name: "Eb4", freq: 311.13, label: "1st String" },
    ],
  },
};

const GuitarTuner = () => {
  return (
    <section id="tuner" className="px-6 md:px-12 py-24 md:py-32">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">Online Guitar Tuner</h2>
        <p className="text-lg text-muted-foreground mb-16 uppercase tracking-wider">A440 TUNER</p>
        
        <TunerInterface />
      </div>
    </section>
  );
};

const TunerInterface = () => {
  const [currentNote, setCurrentNote] = useState<string>("");
  const [isListening, setIsListening] = useState(false);
  const [selectedTuning, setSelectedTuning] = useState<keyof typeof tunings>("standard");
  const [isPolyphonic, setIsPolyphonic] = useState(false);
  const [stringStates, setStringStates] = useState<{ [key: string]: TuningState }>({});
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const playTone = (freq: number, noteName: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = freq;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);

    toast(`Playing ${noteName}: ${freq.toFixed(1)} Hz`);
  };

  const autoCorrelate = (buffer: Float32Array, sampleRate: number): number => {
    let SIZE = buffer.length;
    let sumOfSquares = 0;
    for (let i = 0; i < SIZE; i++) {
      const val = buffer[i];
      sumOfSquares += val * val;
    }
    const rootMeanSquare = Math.sqrt(sumOfSquares / SIZE);
    if (rootMeanSquare < 0.01) return -1;

    let r1 = 0;
    let r2 = SIZE - 1;
    const threshold = 0.2;
    
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buffer[i]) < threshold) {
        r1 = i;
        break;
      }
    }
    
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buffer[SIZE - i]) < threshold) {
        r2 = SIZE - i;
        break;
      }
    }

    buffer = buffer.slice(r1, r2);
    SIZE = buffer.length;

    const c = new Array(SIZE).fill(0);
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE - i; j++) {
        c[i] = c[i] + buffer[j] * buffer[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;
    
    let maxval = -1;
    let maxpos = -1;
    for (let i = d; i < SIZE; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }
    
    let T0 = maxpos;

    const x1 = c[T0 - 1];
    const x2 = c[T0];
    const x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
  };

  const getTuningState = (freq: number, targetFreq: number): TuningState => {
    const cents = 1200 * Math.log2(freq / targetFreq);
    if (Math.abs(cents) < 5) return "tuned";
    return cents > 0 ? "sharp" : "flat";
  };

  const detectPitch = (analyser: AnalyserNode, sampleRate: number) => {
    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);
    
    const freq = autoCorrelate(buffer, sampleRate);
    
    if (freq > 0) {
      const tuning = tunings[selectedTuning];
      const allNotes = [...tuning.strings];
      
      let closest = allNotes[0];
      let minDiff = Math.abs(freq - closest.freq);
      
      for (const note of allNotes) {
        const diff = Math.abs(freq - note.freq);
        if (diff < minDiff) {
          minDiff = diff;
          closest = note;
        }
      }
      
      if (minDiff < closest.freq * 0.1) {
        setCurrentNote(`${closest.name} (${freq.toFixed(1)} Hz)`);

        if (isPolyphonic) {
          const state = getTuningState(freq, closest.freq);
          setStringStates(prev => ({
            ...prev,
            [closest.name]: state
          }));
        }
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(() => detectPitch(analyser, sampleRate));
  };

  const startMicTuner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 8192;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      setIsListening(true);
      detectPitch(analyser, audioContext.sampleRate);
      
      toast("Microphone active - start playing");
    } catch (error) {
      toast("Please allow microphone access");
    }
  };

  const stopMicTuner = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    
    setIsListening(false);
    setCurrentNote("");
    setStringStates({});
  };

  const handleTuningChange = (value: string) => {
    setSelectedTuning(value as keyof typeof tunings);
    if (isListening) {
      stopMicTuner();
    }
    setStringStates({});
  };

  useEffect(() => {
    return () => {
      stopMicTuner();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const tuning = tunings[selectedTuning];

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Select value={selectedTuning} onValueChange={handleTuningChange}>
          <SelectTrigger className="w-[240px] bg-input border-border uppercase tracking-wider h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard (E-A-D-G-B-E)</SelectItem>
            <SelectItem value="dropD">Drop D (D-A-D-G-B-E)</SelectItem>
            <SelectItem value="dadgad">DADGAD</SelectItem>
            <SelectItem value="openG">Open G (D-G-D-G-B-D)</SelectItem>
            <SelectItem value="halfStep">Half Step Down</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={isPolyphonic ? "default" : "outline"}
          size="lg"
          onClick={() => setIsPolyphonic(!isPolyphonic)}
          className="uppercase tracking-wider"
        >
          {isPolyphonic ? 'Polyphonic' : 'Single Note'}
        </Button>
      </div>

      {isPolyphonic && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {tuning.strings.map((string) => {
            const state = stringStates[string.name];
            return (
              <Card
                key={string.name}
                className={`p-6 text-center transition-all duration-300 ${
                  state === "tuned" 
                    ? "border-green-500 bg-green-500/5" 
                    : state === "sharp"
                    ? "border-red-500 bg-red-500/5"
                    : state === "flat"
                    ? "border-yellow-500 bg-yellow-500/5"
                    : "border-border"
                }`}
              >
                <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">{string.label}</div>
                <div className="text-3xl font-bold mb-2">{string.name}</div>
                <div className="text-xs text-muted-foreground">{string.freq.toFixed(1)} Hz</div>
                {state && (
                  <div className={`text-xs mt-3 uppercase tracking-wider font-bold ${
                    state === "tuned" ? "text-green-500" : 
                    state === "sharp" ? "text-red-500" : "text-yellow-500"
                  }`}>
                    {state}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <div className="border-2 border-border p-16 min-h-[240px] flex flex-col items-center justify-center">
        {currentNote ? (
          <>
            <div className="text-7xl md:text-9xl font-bold mb-4 tracking-tight">
              {currentNote.split(' ')[0]}
            </div>
            <div className="text-xl text-muted-foreground uppercase tracking-wider">
              {currentNote.split(' ').slice(1).join(' ')}
            </div>
          </>
        ) : (
          <div className="text-xl text-muted-foreground uppercase tracking-wider">
            {isListening ? "Play a note..." : "Select Note"}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        {tuning.strings.map((string) => (
          <Button
            key={string.name}
            variant="outline"
            onClick={() => playTone(string.freq, string.name)}
            className="uppercase tracking-wider min-w-[80px]"
          >
            {string.name}
          </Button>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={isListening ? stopMicTuner : startMicTuner}
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-16 h-14 uppercase tracking-wider text-base"
        >
          {isListening ? 'Stop Tuner' : 'Start Tuner'}
        </Button>
      </div>
    </div>
  );
};

export default GuitarTuner;
