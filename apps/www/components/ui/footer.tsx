'use client';

import Link from 'next/link';
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from 'next/image';

// SVG components
const DiscordIcon = () => (
  <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z"/>
  </svg>
);

const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export function Footer() {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setShowSuccess(urlParams.get('submission') === 'true' && urlParams.get('form_type') === 'subscribe');
  }, []);

  return (
    <footer className="py-12 md:py-16">
      <div className="container border-t pt-12 md:pt-16">
        <div className="grid gap-8 md:grid-cols-12">
          {/* Logo and tagline */}
          <div className="md:col-span-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/refref-icon.svg"
                width={24}
                height={24}
                alt="RefRef Logo"
              />
              <span className="font-medium">RefRef</span>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Open source Referral Management Platform
            </p>
          </div>

          {/* Links columns */}
          <div className="grid grid-cols-2 gap-8 md:col-span-4">
            <div>
              <h4 className="mb-3 text-sm font-semibold">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/">Overview</Link></li>
                <li><Link href="/docs">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/docs">Docs</Link></li>
                <li><Link href="mailto:support@refref.ai">Contact</Link></li>
              </ul>
            </div>
          </div>

          {/* Subscribe section */}
          <div className="md:col-span-4">
            <div className="flex gap-4 mb-4">
              <Link href="https://github.com/refrefhq/refref" className="text-muted-foreground hover:text-foreground">
                <GithubIcon />
              </Link>
              <Link href="/community" className="text-muted-foreground hover:text-foreground">
                <DiscordIcon />
              </Link>
            </div>
            <form action="https://submit-form.com/ZQzighfzx" className="flex flex-col gap-4">
              <input type="hidden" name="form_name" value="footer_subscription" />
              <input type="hidden" name="_redirect" value="https://refref.ai/?submission=true&form_type=subscribe" />
              <div className="flex gap-2">
                <Input placeholder="Enter your email" type="email" name="email" required />
                <Button type="submit">Subscribe</Button>
              </div>
            </form>
            <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
              <DialogContent className="sm:max-w-md">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold">Successfully Subscribed!</h3>
                    <p className="text-muted-foreground">We&apos;ll send you updates about RefRef at most once a month.</p>
                  </div>
                  <Button onClick={() => setShowSuccess(false)} className="mt-2">Close</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </footer>
  );
}