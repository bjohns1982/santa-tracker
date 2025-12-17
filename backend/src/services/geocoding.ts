// Geocoding service using Nominatim (OpenStreetMap's free geocoding API)

interface GeocodeResult {
  latitude: number;
  longitude: number;
}

export async function geocodeAddress(
  streetNumber: string,
  streetName: string,
  city: string,
  state: string,
  zipCode: string
): Promise<GeocodeResult | null> {
  try {
    // Construct full address
    const address = `${streetNumber} ${streetName}, ${city}, ${state} ${zipCode}`;
    
    // Use Nominatim geocoding API (free, no API key needed)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SantaTracker/1.0', // Required by Nominatim
      },
    });

    if (!response.ok) {
      console.error('Geocoding API error:', response.statusText);
      return null;
    }

    const data: any = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Batch geocode with rate limiting (Nominatim allows 1 request per second)
export async function geocodeAddresses(
  addresses: Array<{
    streetNumber: string;
    streetName: string;
    city: string;
    state: string;
    zipCode: string;
  }>
): Promise<Array<GeocodeResult | null>> {
  const results: Array<GeocodeResult | null> = [];

  for (const address of addresses) {
    const result = await geocodeAddress(
      address.streetNumber,
      address.streetName,
      address.city,
      address.state,
      address.zipCode
    );
    results.push(result);
    
    // Rate limit: wait 1 second between requests
    if (addresses.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

