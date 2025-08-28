import { useState } from "react";
import { Play, Plus, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/anime-hero.jpg";

export const HeroSection = () => {
  const [isTrailerPlaying, setIsTrailerPlaying] = useState(false);

  const featuredAnime = {
    title: "Ethereal Realms",
    description: "In a world where reality bends to the will of those who dare to dream, follow Akira as she discovers her power to traverse between dimensions and uncover the mysteries of the ethereal realms.",
    rating: 9.2,
    year: 2024,
    episodes: 24,
    genre: "Fantasy, Adventure",
    status: "Ongoing"
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Featured Anime"
          className="w-full h-full object-cover scale-105 animate-fade-in"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/20" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div className="space-y-8 animate-fade-in">
          {/* Badge */}
          <div className="flex items-center gap-4">
            <span className="bg-gradient-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-full">
              Featured Series
            </span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="w-4 h-4 fill-warning text-warning" />
              <span className="font-semibold text-foreground">{featuredAnime.rating}</span>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-7xl font-bold gradient-text leading-tight">
              {featuredAnime.title}
            </h1>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="font-medium text-primary">{featuredAnime.genre}</span>
              <span>{featuredAnime.year}</span>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{featuredAnime.episodes} Episodes</span>
              </div>
              <span className="bg-success/20 text-success px-2 py-1 rounded-md text-xs font-medium">
                {featuredAnime.status}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
            {featuredAnime.description}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button 
              variant="hero" 
              size="xl"
              onClick={() => setIsTrailerPlaying(true)}
              className="shadow-float"
            >
              <Play className="w-6 h-6" />
              Watch Now
            </Button>
            <Button variant="glass" size="xl">
              <Plus className="w-6 h-6" />
              My List
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-8 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text">1M+</div>
              <div className="text-sm text-muted-foreground">Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text">4.9★</div>
              <div className="text-sm text-muted-foreground">Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text">2024</div>
              <div className="text-sm text-muted-foreground">Latest</div>
            </div>
          </div>
        </div>

        {/* Video Preview / Poster */}
        <div className="relative animate-scale-in">
          <div className="relative aspect-[2/3] max-w-md mx-auto">
            <div className="glass rounded-3xl overflow-hidden shadow-float hover:shadow-glow transition-all duration-500 hover:scale-105">
              <img 
                src={heroImage} 
                alt={featuredAnime.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button 
                  variant="glass" 
                  size="xl"
                  className="rounded-full backdrop-blur-xl"
                  onClick={() => setIsTrailerPlaying(true)}
                >
                  <Play className="w-8 h-8" />
                </Button>
              </div>

              {/* Floating Info */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="glass rounded-xl p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary-foreground font-medium">Episode 24</span>
                    <span className="text-primary-foreground/80">24:30</span>
                  </div>
                  <div className="mt-2 w-full bg-white/20 rounded-full h-1">
                    <div className="bg-gradient-primary h-1 rounded-full w-3/4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-primary/30 rounded-full blur-sm animate-float" />
      <div className="absolute top-40 right-20 w-6 h-6 bg-secondary/20 rounded-full blur-sm animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-40 left-1/4 w-3 h-3 bg-accent/40 rounded-full blur-sm animate-float" style={{ animationDelay: '2s' }} />
    </section>
  );
};