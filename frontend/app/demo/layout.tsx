import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo Wall - Memento",
  description: "Live demo wall experience",
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
