export type BarType = 'Cocktail' | 'Pub' | 'Sports' | 'Wine' | 'Craft-beer' | 'Nightclub';

export interface Bar {
  id: string;
  name: string;
  type: BarType;
  coordinates: [number, number]; // [lng, lat]
  address: string;
  rating: number;
  image: string;
  description: string;
  priceLevel: number; // 1-3
}

export const bars: Bar[] = [
  {
    id: '1',
    name: 'Magic Ice Bar',
    type: 'Cocktail',
    coordinates: [5.312649, 60.397462],
    address: 'C. Sundts gate 50',
    rating: 4.7,
    image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/90/33/6c/enjoy-a-drink-in-the.jpg?w=1000&h=-1&s=1',
    description: 'Modern cocktail bar with innovative drinks and stunning waterfront views.',
    priceLevel: 3,
  },
  {
    id: '2',
    name: 'Apollon Platebar',
    type: 'Wine',
    coordinates: [5.323083, 60.389679],
    address: 'Vaskerelven 6',
    rating: 4.5,
    image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/1b/24/6a/photo0jpg.jpg?w=1000&h=-1&s=1',
    description: "A unique cultural hub that combines Norway's oldest independent record store with a popular bar.",
    priceLevel: 2,
  },
  {
    id: '3',
    name: 'No Stress Wine Bar',
    type: 'Wine',
    coordinates: [5.326560, 60.394901],
    address: 'Hollendergaten 11',
    rating: 4.5,
    image: 'https://lh3.googleusercontent.com/p/AF1QipOzeLC9Z_2OHvrRi7VdYbj5VYf4_Vr3irqAM2jL=s680-w680-h510-rw',
    description: 'No Stress is a local cocktail pub with multiple locations, offering sweet cocktails, a cozy atmosphere, and events like music bingo and Mario Kart.',
    priceLevel: 2,
  },,
  {
    id: '4',
    name: 'Naboen',
    type: 'Craft-beer',
    coordinates: [5.320839, 60.391217],
    address: 'Sigurds gate 8',
    rating: 4.6,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToEa88jvN3q5sD9FXn6Yj70MPCnBi3sFjztA&s',
    description: 'Craft beer haven with rotating taps and knowledgeable staff.',
    priceLevel: 2,
  },
  {
    id: '5',
    name: 'Altona Vinbar',
    type: 'Wine',
    coordinates: [5.3265, 60.3954],
    address: 'Strandgaten 81',
    rating: 4.4,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDEEhompIPIpUTA5d1IjtvSm_SUltjPa87Ug&s',
    description: 'Elegant wine bar in historic Bryggen area.',
    priceLevel: 3,
  },
  {
    id: '6',
    name: 'Henrik Øl & Vinstove',
    type: 'Craft-beer',
    coordinates: [5.3247, 60.3963],
    address: 'Engen 10',
    rating: 4.5,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYGb__8LmiV2gRQJV2DT08Tq0gCUAQG2OvEQ&s',
    description: 'Cozy bar with extensive beer and wine menu.',
    priceLevel: 2,
  },
  {
    id: '7',
    name: 'Familien',
    type: 'Nightclub',
    coordinates: [5.3321, 60.3911],
    address: 'Georgernes Verft 12',
    rating: 4.1,
    image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&h=600&fit=crop',
    description: 'Popular nightclub with dance floor and live DJs.',
    priceLevel: 2,
  },
  {
    id: '8',
    name: 'Vågsbunnen Sports Bar',
    type: 'Sports',
    coordinates: [5.3289, 60.3889],
    address: 'Vågsbunnen 4',
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&h=600&fit=crop',
    description: 'Sports bar with multiple screens and great atmosphere.',
    priceLevel: 2,
  },
  {
    id: '9',
    name: 'Marg & Bein',
    type: 'Cocktail',
    coordinates: [5.3255, 60.3947],
    address: 'Vetrlidsalmennigen 20',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&h=600&fit=crop',
    description: 'Award-winning cocktail bar with creative menu.',
    priceLevel: 3,
  },
  {
    id: '10',
    name: 'Café Opera',
    type: 'Pub',
    coordinates: [5.3295, 60.3932],
    address: 'Engen 18',
    rating: 4.0,
    image: 'https://images.unsplash.com/photo-1543007631-283050bb3e8c?w=800&h=600&fit=crop',
    description: 'Historic pub in the heart of Bergen.',
    priceLevel: 2,
  },
];

export const barTypes: { value: BarType; label: string }[] = [
  { value: 'Cocktail', label: 'Cocktail Bar' },
  { value: 'Pub', label: 'Pub' },
  { value: 'Sports', label: 'Sports Bar' },
  { value: 'Wine', label: 'Wine Bar' },
  { value: 'Craft-beer', label: 'Craft Beer' },
  { value: 'Nightclub', label: 'Nightclub' },
];
