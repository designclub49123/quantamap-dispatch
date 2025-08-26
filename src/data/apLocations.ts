
export interface APLocation {
  name: string;
  lat: number;
  lng: number;
  district: string;
  type: 'city' | 'town' | 'village';
}

export const apLocations: APLocation[] = [
  // Major Cities
  { name: "Visakhapatnam", lat: 17.6868, lng: 83.2185, district: "Visakhapatnam", type: "city" },
  { name: "Vijayawada", lat: 16.5062, lng: 80.6480, district: "Krishna", type: "city" },
  { name: "Guntur", lat: 16.3067, lng: 80.4365, district: "Guntur", type: "city" },
  { name: "Nellore", lat: 14.4426, lng: 79.9865, district: "Nellore", type: "city" },
  { name: "Kurnool", lat: 15.8281, lng: 78.0373, district: "Kurnool", type: "city" },
  { name: "Rajahmundry", lat: 17.0005, lng: 81.8040, district: "East Godavari", type: "city" },
  { name: "Tirupati", lat: 13.6288, lng: 79.4192, district: "Chittoor", type: "city" },
  { name: "Kadapa", lat: 14.4673, lng: 78.8242, district: "Kadapa", type: "city" },
  { name: "Anantapur", lat: 14.6819, lng: 77.6006, district: "Anantapur", type: "city" },
  { name: "Eluru", lat: 16.7107, lng: 81.0953, district: "West Godavari", type: "city" },
  
  // Towns
  { name: "Machilipatnam", lat: 16.1874, lng: 81.1385, district: "Krishna", type: "town" },
  { name: "Ongole", lat: 15.5057, lng: 80.0499, district: "Prakasam", type: "town" },
  { name: "Chittoor", lat: 13.2172, lng: 79.1003, district: "Chittoor", type: "town" },
  { name: "Hindupur", lat: 13.8283, lng: 77.4911, district: "Anantapur", type: "town" },
  { name: "Proddatur", lat: 14.7504, lng: 78.5482, district: "Kadapa", type: "town" },
  { name: "Bhimavaram", lat: 16.5449, lng: 81.5212, district: "West Godavari", type: "town" },
  { name: "Madanapalle", lat: 13.5503, lng: 78.5026, district: "Chittoor", type: "town" },
  { name: "Giddalur", lat: 15.3667, lng: 78.9167, district: "Prakasam", type: "town" },
  { name: "Narasaraopet", lat: 16.2350, lng: 80.0498, district: "Guntur", type: "town" },
  { name: "Gudivada", lat: 16.4333, lng: 80.9833, district: "Krishna", type: "town" },
  
  // Villages
  { name: "Mangalagiri", lat: 16.4318, lng: 80.5653, district: "Guntur", type: "village" },
  { name: "Amaravati", lat: 16.5734, lng: 80.3570, district: "Guntur", type: "village" },
  { name: "Tadepalli", lat: 16.4667, lng: 80.6000, district: "Guntur", type: "village" },
  { name: "Kanuru", lat: 16.2833, lng: 81.2167, district: "Krishna", type: "village" },
  { name: "Tanuku", lat: 16.7547, lng: 81.6830, district: "West Godavari", type: "village" }
];

export const getRandomAPLocation = (): APLocation => {
  return apLocations[Math.floor(Math.random() * apLocations.length)];
};

export const isWithinAP = (lat: number, lng: number): boolean => {
  // AP boundaries (approximate)
  const apBounds = {
    north: 19.9,
    south: 12.6,
    east: 84.8,
    west: 76.8
  };
  
  return lat >= apBounds.south && 
         lat <= apBounds.north && 
         lng >= apBounds.west && 
         lng <= apBounds.east;
};
