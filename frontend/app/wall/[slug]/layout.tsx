import { Metadata, ResolvingMetadata } from 'next';
import { supabase } from '@/lib/supabase';

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params;
  const slug = params.slug;

  // Fetch data
  const { data: event } = await supabase
    .from('events')
    .select('name, created_at')
    .eq('slug', slug)
    .single();

  if (!event) {
    return {
      title: 'Memento Wall Not Found',
    };
  }

  const title = `${event.name} | Memento Live Photo Wall`;
  const description = `Join the live photo wall for ${event.name}. Scan, snap, and share memories instantly!`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://mymementoapp.com/wall/${slug}`,
      siteName: 'Memento',
      images: [
        {
          url: '/og-image.jpg', // You can replace this with a dynamic edge function if needed later
          width: 1200,
          height: 630,
          alt: `Live Photo Wall for ${event.name}`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.jpg'],
    },
  };
}

export default function WallLayout({ children }: Props) {
  return <>{children}</>;
}
