import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In / Sign Up',
  description: 'Access your Memento account to manage your event photo walls.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
