import type { Metadata } from "next";
import { ContactClient } from "@/components/public/PublicViews";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact the HACKSYRA and Innovation Hacks team for hosting help, partnerships, or support.",
};

export default function ContactPage() {
  return <ContactClient />;
}
