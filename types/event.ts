export interface Event {
  id: string;
  artistName: string;
  venue: string;
  date: string;
  time?: string;
  location: string;
  city: string;
  country?: string; // Added for global events
  ticketUrl?: string;
  source: 'concert-ua' | 'kontramarka' | 'karabas' | 'bandsintown' | 'ticketmaster';
  imageUrl?: string;
  genres?: string[]; // Detected genres for the event
  isStyleMatch?: boolean; // True if matched by genre, not exact artist
  distance?: number; // Distance in km from user location
  vibeMatch?: number; // Vibe match percentage (60-100)
}

export interface UserLocation {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}
