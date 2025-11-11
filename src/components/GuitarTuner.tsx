import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic } from "lucide-react";
import { toast } from "sonner";

const strings = [
  { name: "E", freq: 82.41, label: "E (82 Hz)" },
  { name: "A", freq: 110.0, label: "A (110 Hz)" },
  { name: "D", freq: 146.83, label: "D (147 Hz)" },
  { name: "G", freq: 196.0, label: "G (196 Hz)" },
  { name: "B", freq: 246.94, label: "B (247 Hz)" },
  { name: "E4", freq: 329.63, label: "E (330 Hz)" },
];

const pitches = [
  { name: "E2", freq: 82.41 },
  { name: "A2", freq: 110.0 },
  { name: "D3", freq: 146.83 },
  { name: "G3", freq: 196.0 },
  { name: "B3", freq: 246.94 },
  { name: "E4", freq: 329.63 },
];

const GuitarTuner = () => {
  const [currentNote, setCurrentNote] = useState("–");
  const [isListening, setIsListening] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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

    for (let lag = 80; lag < SIZE / 2; lag++) {
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

  const detectPitch = (analyser: AnalyserNode, sampleRate: number) => {
    const buffer = new Float32Array(analyser.fftSize);

    const loop = () => {
      analyser.getFloatTimeDomainData(buffer);
      const freq = autoCorrelate(buffer, sampleRate);

      if (freq > 0) {
        const closest = pitches.reduce((a, b) =>
          Math.abs(b.freq - freq) < Math.abs(a.freq - freq) ? b : a
        );
        const cents = 1200 * Math.log2(freq / closest.freq);
        const centsStr = cents > 0 ? ` +${cents.toFixed(0)}¢` : ` ${cents.toFixed(0)}¢`;
        setCurrentNote(`${closest.name}${centsStr}`);
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
      toast.success("Microphone tuner activated");
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
    toast.info("Microphone tuner stopped");
  };

  return (
    <section id="tuner" className="px-4 md:px-12 py-16 md:py-24">
      <Card className="bg-card border-border p-8 md:p-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Guitar Tuner</h2>
        <div className="text-5xl md:text-6xl font-bold mb-6 text-primary min-h-[80px] flex items-center justify-center">
          {currentNote}
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {strings.map((string) => (
            <Button
              key={string.label}
              variant="secondary"
              onClick={() => playTone(string.freq, string.name)}
              className="font-medium"
            >
              {string.label}
            </Button>
          ))}
        </div>

        <Button
          onClick={isListening ? stopMicTuner : startMicTuner}
          size="lg"
          variant={isListening ? "destructive" : "default"}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
        >
          <Mic className="mr-2 h-5 w-5" />
          {isListening ? "Stop microphone" : "Use microphone"}
        </Button>
      </Card>
    </section>
  );
};

export default GuitarTuner;
