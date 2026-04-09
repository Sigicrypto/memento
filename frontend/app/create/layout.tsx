import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create New Wall',
  description: 'Launch a new interactive photo gallery for your wedding, party, or corporate event.',
};

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
