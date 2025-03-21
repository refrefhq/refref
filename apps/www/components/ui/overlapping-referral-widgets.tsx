"use client"

import { useState } from "react"
import { Check, Copy, Mail, Share2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function OverlappingReferralWidgets() {
  const [activeCard, setActiveCard] = useState(0)
  const [copiedStates, setCopiedStates] = useState([false, false, false])

  const referralLinks = ["acme.refref.ai/r/th5tdf", "acme.com/r/xyz789", "acme.com/r/xyz789"]

  const copyToClipboard = (index: number) => {
    navigator.clipboard.writeText(referralLinks[index])
    const newCopiedStates = [...copiedStates]
    newCopiedStates[index] = true
    setCopiedStates(newCopiedStates)
    setTimeout(() => {
      const resetStates = [...copiedStates]
      resetStates[index] = false
      setCopiedStates(resetStates)
    }, 2000)
  }

  const bringToFront = (index: number) => {
    setActiveCard(index)
  }

  return (
    <div className="flex items-center justify-center min-h-[800px] p-4 overflow-hidden">
      <div className="relative w-full max-w-6xl h-[700px]">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 text-amber-400 text-4xl">✧</div>
        <div className="absolute top-20 right-20 text-blue-400 text-3xl">★</div>
        <div className="absolute bottom-20 left-20 text-green-400">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10,60 Q60,10 110,60" stroke="#4ADE80" strokeWidth="2" />
          </svg>
        </div>
        <div className="absolute top-[40%] right-[30%] text-green-400">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20,50 L80,50" stroke="#4ADE80" strokeWidth="2" />
          </svg>
        </div>
        <div className="absolute bottom-10 right-40 text-slate-800">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10,90 Q50,10 90,50" stroke="#0F172A" strokeWidth="2" />
          </svg>
        </div>
        <div className="absolute bottom-20 left-40 text-green-400">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5,15 L15,15" stroke="#4ADE80" strokeWidth="2" />
            <path d="M2,20 L10,20" stroke="#4ADE80" strokeWidth="2" />
            <path d="M3,25 L8,25" stroke="#4ADE80" strokeWidth="2" />
          </svg>
        </div>

        {/* First Card - Refer & Earn (Left, overlapping right column by 10%) */}
        <div
          className={`absolute transition-all duration-500 ease-in-out cursor-pointer ${
            activeCard === 0
              ? "z-30 top-[20%] left-[15%] rotate-0 scale-100"
              : "z-10 top-[20%] left-[15%] rotate-0 scale-95 "
          }`}
          onClick={() => bringToFront(0)}
        >
          <Card className="w-full max-w-md bg-black border border-zinc-800 text-gray-100 shadow-xl">
            <CardHeader className="pb-0">
              <CardTitle className="text-xl font-bold text-white">Refer & Earn</CardTitle>
              <CardDescription className="text-zinc-400">Share with friends and colleagues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-zinc-900 p-6 text-center border border-zinc-800 relative overflow-hidden">
                <div className="absolute -right-2 -top-2 text-4xl rotate-12 opacity-80">💸</div>
                <div className="absolute -left-2 -bottom-2 text-4xl -rotate-12 opacity-80">✨</div>
                <h3 className="text-2xl font-bold text-white mb-2">Get $50 💰</h3>
                <p className="text-zinc-300 mb-1">for each successful referral</p>
                <p className="text-emerald-400 text-sm font-medium">No limit on earnings!</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="referral-link-1" className="text-sm font-medium text-zinc-300">
                  Your personal referral link
                </label>
                <div className="flex">
                  <Input
                    id="referral-link-1"
                    value={referralLinks[0]}
                    readOnly
                    className="rounded-r-none bg-zinc-900 border-zinc-800 text-zinc-200"
                  />
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      copyToClipboard(0)
                    }}
                    variant="secondary"
                    className="rounded-l-none border border-l-0 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200"
                    aria-label="Copy referral link"
                  >
                    {copiedStates[0] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-zinc-800 pt-4">
              <div className="flex justify-center w-full gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                  </svg>
                  <span className="sr-only">Share on X</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                  </svg>
                  <span className="sr-only">Share on LinkedIn</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Mail className="h-4 w-4" />
                  <span className="sr-only">Share via Email</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">More sharing options</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Second Card - Review and Earn (Top Right) */}
        <div
          className={`absolute transition-all duration-500 ease-in-out cursor-pointer ${
            activeCard === 1
              ? "z-30 top-[10%] left-[50%] rotate-0 scale-100"
              : "z-10 top-[10%] left-[50%] rotate-0 scale-95"
          }`}
          onClick={() => bringToFront(1)}
        >
          <Card className="w-full max-w-xl bg-black border border-zinc-800 text-gray-100 shadow-xl">
            <CardHeader className="pb-0">
              <CardTitle className="text-xl font-bold text-white">Review and Earn</CardTitle>
              <CardDescription className="text-zinc-400">Earn cash for your honest review</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* G2 Review Row */}
              <div className="rounded-lg bg-zinc-900 p-4 flex items-center justify-between border border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="bg-zinc-800 p-2 rounded-md">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  </div>
                  <span className="font-medium">G2</span>
                </div>
                <div className="text-emerald-400 font-semibold">$100</div>
              </div>

              {/* Trustradius Review Row */}
              <div className="rounded-lg bg-zinc-900 p-4 flex items-center justify-between gap-20 border border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="bg-zinc-800 p-2 rounded-md">
                    <Star className="h-5 w-5 fill-blue-400 text-blue-400" />
                  </div>
                  <span className="font-medium">Trustradius</span>
                </div>
                <div className="text-emerald-400 font-semibold">$100</div>
              </div>

              {/* Capterra Review Row */}
              <div className="rounded-lg bg-zinc-900 p-4 flex items-center justify-between border border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="bg-zinc-800 p-2 rounded-md">
                    <Star className="h-5 w-5 fill-purple-400 text-purple-400" />
                  </div>
                  <span className="font-medium">Capterra</span>
                </div>
                <div className="text-emerald-400 font-semibold">$100</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Third Card - 20% Off (Bottom Right, slightly overlapping with Refer & Earn) */}
        <div
          className={`absolute transition-all duration-500 ease-in-out cursor-pointer ${
            activeCard === 2
              ? "z-30 top-[40%] left-[48%] rotate-0 scale-100"
              : "z-10 top-[40%] left-[48%] rotate-0 scale-95"
          }`}
          onClick={() => bringToFront(2)}
        >
          <Card className="w-full max-w-md bg-black border border-zinc-800 text-gray-100 shadow-xl">
            <CardHeader className="pb-0">
              <CardTitle className="text-xl font-bold text-white">Give 20% Off</CardTitle>
              <CardDescription className="text-zinc-400">Share discounts with your friends</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-zinc-900 p-6 text-center border border-zinc-800 relative overflow-hidden">
                <div className="absolute -right-2 -top-2 text-4xl rotate-12 opacity-80">🎁</div>
                <div className="absolute -left-2 -bottom-2 text-4xl -rotate-12 opacity-80">🔖</div>
                <h3 className="text-2xl font-bold text-white mb-2">20% OFF 🏷️</h3>
                <p className="text-zinc-300 mb-1">for new memberships</p>
                <p className="text-purple-400 text-sm font-medium">They save, you earn rewards!</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="referral-link-3" className="text-sm font-medium text-zinc-300">
                  Your discount referral link
                </label>
                <div className="flex">
                  <Input
                    id="referral-link-3"
                    value={referralLinks[2]}
                    readOnly
                    className="rounded-r-none bg-zinc-900 border-zinc-800 text-zinc-200"
                  />
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      copyToClipboard(2)
                    }}
                    variant="secondary"
                    className="rounded-l-none border border-l-0 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200"
                    aria-label="Copy discount link"
                  >
                    {copiedStates[2] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

