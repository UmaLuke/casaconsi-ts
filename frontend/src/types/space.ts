// src/types/space.ts

export interface Space {
  id: number;
  title: string;
  location: string;
  price: string;
  hostType: string;
  amenities: string[];
  imageUrl: string;
  verified: boolean;
}
