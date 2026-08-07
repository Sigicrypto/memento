import { NextResponse } from 'next/server';

const SAMPLE_LEADS: Record<string, any[]> = {
  wedding: [
    {
      id: 'lead-w1',
      name: 'Royal Touch Wedding Planners',
      category: 'wedding',
      phone: '+919876543210',
      website: 'https://royaltouchweddings.example.com',
      rating: 4.9,
      address: 'Bandra West, Mumbai',
      status: 'new',
    },
    {
      id: 'lead-w2',
      name: 'Vedic Ceremonies & Events',
      category: 'wedding',
      phone: '+919812345678',
      website: 'https://vedicevents.example.com',
      rating: 4.8,
      address: 'Juhu, Mumbai',
      status: 'new',
    },
    {
      id: 'lead-w3',
      name: 'Grand Celebration Crafters',
      category: 'wedding',
      phone: '+919988776655',
      website: 'https://grandcelebrations.example.com',
      rating: 4.7,
      address: 'South Ex, New Delhi',
      status: 'new',
    },
  ],
  corporate: [
    {
      id: 'lead-c1',
      name: 'Apex Corporate Event Management',
      category: 'corporate',
      phone: '+919822001122',
      website: 'https://apexevents.example.com',
      rating: 4.9,
      address: 'BKC, Mumbai',
      status: 'new',
    },
    {
      id: 'lead-c2',
      name: 'Nexus Brand Activations & Galas',
      category: 'corporate',
      phone: '+919711223344',
      website: 'https://nexusactivations.example.com',
      rating: 4.8,
      address: 'Cyber City, Gurugram',
      status: 'new',
    },
  ],
  venue: [
    {
      id: 'lead-v1',
      name: 'The Imperial Banquet Palace',
      category: 'venue',
      phone: '+919900112233',
      website: 'https://imperialbanquets.example.com',
      rating: 4.9,
      address: 'Worli, Mumbai',
      status: 'new',
    },
    {
      id: 'lead-v2',
      name: 'Starlight Resort & Event Lawns',
      category: 'venue',
      phone: '+919844556677',
      website: 'https://starlightlawns.example.com',
      rating: 4.7,
      address: 'ECR, Chennai',
      status: 'new',
    },
  ],
};

export async function POST(request: Request) {
  try {
    const { category = 'wedding', location = 'Mumbai' } = await request.json();
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (apiKey) {
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        `${category} in ${location}`
      )}&key=${apiKey}`;

      const res = await fetch(searchUrl);
      const data = await res.json();

      if (data.results && Array.isArray(data.results)) {
        const leads = data.results.slice(0, 10).map((place: any, i: number) => ({
          id: place.place_id || `place-${i}`,
          name: place.name,
          category,
          phone: place.formatted_phone_number || '+919800000000',
          website: place.website || 'N/A',
          rating: place.rating || 4.5,
          address: place.formatted_address || location,
          status: 'new',
        }));

        return NextResponse.json({ success: true, source: 'google_places', leads });
      }
    }

    // Fallback dataset if Google API Key is not set yet
    const categoryKey = category.toLowerCase().includes('corporate')
      ? 'corporate'
      : category.toLowerCase().includes('venue') || category.toLowerCase().includes('banquet')
      ? 'venue'
      : 'wedding';

    const baseLeads = SAMPLE_LEADS[categoryKey] || SAMPLE_LEADS.wedding;
    const leads = baseLeads.map((item) => ({
      ...item,
      address: `${item.address.split(',')[0]}, ${location}`,
    }));

    return NextResponse.json({
      success: true,
      source: 'curated_directory',
      message: 'Showing target lead dataset (Add GOOGLE_PLACES_API_KEY for live Google Places search)',
      leads,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lead search failed' }, { status: 500 });
  }
}
