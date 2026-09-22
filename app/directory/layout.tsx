import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore | Jev Verdict",
  description: "Discover what people are building with the TypeSafe Jev model.",
};

export default function DirectoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
