import Link from "next/link";
import Image from "next/image";
import { Compass, Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="max-w-md w-full card p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 p-1.5 shadow-xs mx-auto mb-5">
          <Image src="/logos/ih_logo.png" alt="HACKSYRA" width={40} height={40} className="w-full h-full object-contain" />
        </div>
        <span className="badge-violet mb-3">404 · Page not found</span>
        <h1 className="font-display font-bold text-3xl text-slate-900 mt-1">We couldn&apos;t find that page</h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          The hackathon or page you&apos;re looking for may have moved, or the URL might be mistyped.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <Link href="/" className="btn-primary">
            <Home size={16} /> Back home
          </Link>
          <Link href="/hackathons" className="btn-secondary">
            <Compass size={16} /> Explore hackathons
          </Link>
        </div>
      </div>
    </div>
  );
}

