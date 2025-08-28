import { useState } from "react";
import { Heart, Play, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Anime {
  id: string; // غيرتها من number → string عشان تمشي مع Firebase
  title: string;
  image: string;
  rating: number;
  genre: string;
  year: number;
  episodes?: number;
  isNew?: boolean;
  isTrending?: boolean;
}

interface AnimeCardProps {
  anime: Anime;
}

export const AnimeCard = ({ anime }: AnimeCardProps) => {
  const { 
    id, 
    title, 
    image, 
    rating, 
    genre, 
    episodes = 12, 
    year,
    isNew,
    isTrending 
  } = anime;

  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <div 
      className="group relative overflow-hidden rounded-2xl glass hover:shadow-float transition-all duration-500 hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Status Badges */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        {isNew && (
          <span className="bg-gradient-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
            NEW
          </span>
        )}
        {isTrending && (
          <span className="bg-warning text-background text-xs font-semibold px-3 py-1 rounded-full">
            TRENDING
          </span>
        )}
      </div>

      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        
        {/* Hover Controls */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <Link to={`/anime/${id}`}>
  <Button variant="hero" size="lg" className="rounded-full">
    <Play className="w-6 h-6" />
    شاهد الآن
  </Button>
</Link>
        </div>

        {/* Quick Actions */}
        <div className={`absolute top-4 right-4 flex flex-col gap-2 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }`}>
          <Button
            variant="glass"
            size="icon"
            onClick={() => setIsFavorited(!isFavorited)}
            className="backdrop-blur-md"
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button variant="glass" size="icon" className="backdrop-blur-md">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-warning text-warning" />
            <span className="font-medium">{rating}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="font-medium text-primary">{genre}</span>
          <span>{year}</span>
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground">
          {episodes} Episodes
        </div>
      </div>
    </div>
  );
};