import { HomeHero } from "@/components/home/HomeHero";
import { LiveHackathonSections } from "@/components/home/LiveHackathonSections";
import { HowHostingWorks } from "@/components/home/HowHostingWorks";
import {
  OrganizersMarquee,
  LiveCommunityShowcase,
  LiveTestimonials,
  FaqAndFinalCta,
} from "@/components/home/HomeSections";

export default function HomePage() {
  return (
    <div className="bg-white">
      <HomeHero />
      <OrganizersMarquee />
      <LiveHackathonSections />
      <HowHostingWorks />
      <LiveCommunityShowcase />
      <LiveTestimonials />
      <FaqAndFinalCta />
    </div>
  );
}
