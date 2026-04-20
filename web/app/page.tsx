import { Hero } from "@/components/landing/hero";
import { Discover } from "@/components/landing/discover";
import { Collaborate } from "@/components/landing/collaborate";
import { Learn } from "@/components/landing/learn";
import { CTA } from "@/components/landing/cta";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Discover />
      <Collaborate />
      <Learn />
      <CTA />
    </div>
  );
}
