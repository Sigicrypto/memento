import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload to Demo Wall - Memento",
  description: "Upload photos and videos to the live demo wall",
};

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
