// src/pages/Watch.tsx
import { Layout } from "@/components/Layout";
import { useState, useRef } from "react";
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Settings, 
  SkipBack, SkipForward, Subtitles, Download 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// mock مؤقت – تقدر تجيب البيانات من Firestore بداله
const mockEpisode = {
  id: 1,
  title: "Boni and Kuma",
  animeTitle: "Attack on Titan",
  number: 1,
  season: "Season 1",
  duration: "24:32",
  currentTime: "00:00",
  videoUrl: "https://pixeldrain.com/api/file/yjXSwC4q" // رابط مباشر للفيديو
};

export const Watch = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [progress, setProgress] = useState([0]);
  const [quality, setQuality] = useState("720p");
  const [subtitles, setSubtitles] = useState("English");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Play / Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Progress Bar
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const progressValue = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress([progressValue]);
  };

  const handleSeek = (val: number[]) => {
    if (!videoRef.current) return;
    const newTime = (val[0] / 100) * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
    setProgress(val);
  };

  // Volume
  const handleVolume = (val: number[]) => {
    if (!videoRef.current) return;
    const vol = val[0] / 100;
    videoRef.current.volume = vol;
    setVolume(val);
    setIsMuted(vol === 0);
  };

  return (
    <Layout>
      <div className="pb-24 md:pb-8">
        {/* Video Player */}
        <div className="relative bg-black aspect-video">
          <video
            ref={videoRef}
            src={mockEpisode.videoUrl}
            className="w-full h-full"
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
          />

          {/* Controls Overlay */}
          <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/70 via-transparent to-black/40">
            
            {/* Top Controls */}
            <div className="flex items-center justify-between p-4 text-white">
              <div>
                <h2 className="text-lg font-semibold">{mockEpisode.animeTitle}</h2>
                <p className="text-sm text-white/80">
                  {mockEpisode.season} • Episode {mockEpisode.number}: {mockEpisode.title}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Subtitles className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Settings className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => videoRef.current?.requestFullscreen()}>
                  <Maximize className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Center Play Button */}
            <div className="flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
              </Button>
            </div>

            {/* Bottom Controls */}
            <div className="p-4">
              {/* Progress Bar */}
              <Slider
                value={progress}
                onValueChange={handleSeek}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex items-center justify-between mt-2 text-white text-xs">
                <span>{Math.floor((progress[0] / 100) * (videoRef.current?.duration || 0))}s</span>
                <span>{mockEpisode.duration}</span>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <SkipBack className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={togglePlay}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <SkipForward className="w-5 h-5" />
                  </Button>

                  {/* Volume */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                      onClick={() => {
                        if (!videoRef.current) return;
                        videoRef.current.muted = !isMuted;
                        setIsMuted(!isMuted);
                      }}
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>
                    <div className="w-20">
                      <Slider value={volume} onValueChange={handleVolume} max={100} step={1} />
                    </div>
                  </div>
                </div>

                <div>
                  <Select value={quality} onValueChange={setQuality}>
                    <SelectTrigger className="w-20 h-8 text-white border-white/20 bg-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1080p">1080p</SelectItem>
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="480p">480p</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info + Episodes List (زي ما كان عندك) */}
        <div className="container mx-auto px-4 py-6">
          <Card className="p-6">
            <h1 className="text-2xl font-bold">Episode {mockEpisode.number}: {mockEpisode.title}</h1>
            <p className="text-muted-foreground">{mockEpisode.animeTitle} • {mockEpisode.season}</p>
          </Card>
        </div>
      </div>
    </Layout>
  );
};