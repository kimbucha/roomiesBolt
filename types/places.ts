export interface PlaceData {
  id: string;
  title: string;
  description: string;
  budget: string;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  images: string[];
  amenities: string[];
  roomType: 'private' | 'shared' | 'studio';
  houseRules: string[];
  host: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
    rating: number;
    responseTime: string;
  };
  availability: {
    from: string;
    to: string;
  };
}

export interface SimilarPlacesProps {
  currentPlaceId: string;
  currentLocation: string;
}

export interface ImageGalleryProps {
  images: string[];
  scrollY: any;
  onGalleryPress: () => void;
}

export interface CriticalInfoCardProps {
  title: string;
  price: string;
  location: string;
  roomType: string;
  onBookNowPress: () => void;
}

export interface HostProfileCardProps {
  host: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
    rating: number;
    responseTime: string;
  };
  joinDate: string;
  responseRate: number;
}

export interface TabbedContentProps {
  description: string;
  amenities: string[];
  houseRules: string[];
}

export interface LocationMapPreviewProps {
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface ContactHostButtonProps {
  scrollY: any;
  onPress: () => void;
  hostName: string;
}

export interface Amenity {
  type: string;
  title: string;
  description?: string;
}

export interface Rule {
  title: string;
  description?: string;
  allowed: boolean;
}

export interface Place {
  id: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  rating: number;
  hostId: string;
  amenities: Amenity[];
  rules: Rule[];
  isAvailable: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
} 