
const GRAPHHOPPER_API_KEY = "15b1ebc7-33a5-4f7d-971b-37ca13175d8a";
const GRAPHHOPPER_BASE_URL = "https://graphhopper.com/api/1";

export interface Route {
  distance: number;
  time: number;
  points: [number, number][];
}

export interface GraphHopperResponse {
  paths: Array<{
    distance: number;
    time: number;
    points: {
      coordinates: [number, number][];
    };
  }>;
}

export const getRoute = async (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  vehicle: string = "car"
): Promise<Route | null> => {
  try {
    const url = `${GRAPHHOPPER_BASE_URL}/route?` +
      `point=${fromLat},${fromLng}&` +
      `point=${toLat},${toLng}&` +
      `vehicle=${vehicle}&` +
      `key=${GRAPHHOPPER_API_KEY}&` +
      `points_encoded=false`;

    const response = await fetch(url);
    const data: GraphHopperResponse = await response.json();

    if (data.paths && data.paths.length > 0) {
      const path = data.paths[0];
      return {
        distance: path.distance,
        time: path.time,
        points: path.points.coordinates
      };
    }

    return null;
  } catch (error) {
    console.error('GraphHopper routing error:', error);
    return null;
  }
};

export const getMatrix = async (
  origins: [number, number][],
  destinations: [number, number][],
  vehicle: string = "car"
): Promise<number[][] | null> => {
  try {
    const url = `${GRAPHHOPPER_BASE_URL}/matrix?` +
      `key=${GRAPHHOPPER_API_KEY}&` +
      `vehicle=${vehicle}`;

    const body = {
      from_points: origins,
      to_points: destinations,
      out_arrays: ["times", "distances"]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return data.times || null;
  } catch (error) {
    console.error('GraphHopper matrix error:', error);
    return null;
  }
};
