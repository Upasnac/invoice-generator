"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { createClient } from "@/lib/supabase/client"

type LandingAuthButtonsProps = {
  location?: "navbar" | "hero" | "cta"
}

export function LandingAuthButtons({
  location = "hero",
}: LandingAuthButtonsProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setIsLoggedIn(!!user)
      setLoading(false)
    }

    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Prevent buttons changing while auth is loading
  if (loading) {
    if (location === "navbar") {
      return (
        <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
      )
    }

    return (
      <div className="h-11 w-40 animate-pulse rounded-md bg-muted" />
    )
  }

  // =========================
  // LOGGED IN
  // =========================

  if (isLoggedIn) {
    if (location === "cta") {
      return (
        <Link
          href="/dashboard"
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-background px-5 py-3 text-sm font-semibold text-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          Go to Dashboard

          <ArrowRightIcon className="size-4" />
        </Link>
      )
    }

    if (location === "navbar") {
      return (
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Go to Dashboard

          <ArrowRightIcon className="size-4" />
        </Link>
      )
    }

    return (
      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
      >
        Go to Dashboard

        <ArrowRightIcon className="size-4" />
      </Link>
    )
  }

  // =========================
  // LOGGED OUT
  // =========================

  if (location === "navbar") {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="hidden rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-muted sm:inline-flex"
        >
          Sign In
        </Link>

        <Link
          href="/signup"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Get Started
        </Link>
      </div>
    )
  }

  if (location === "cta") {
    return (
      <Link
        href="/signup"
        className="mt-8 inline-flex items-center gap-2 rounded-md bg-background px-5 py-3 text-sm font-semibold text-foreground shadow-sm transition-opacity hover:opacity-90"
      >
        Get Started

        <ArrowRightIcon className="size-4" />
      </Link>
    )
  }

  return (
    <>
      <Link
        href="/signup"
        className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
      >
        Create Free Account

        <ArrowRightIcon className="size-4" />
      </Link>

      <Link
        href="/login"
        className="inline-flex items-center justify-center rounded-md border bg-background px-5 py-3 text-sm font-semibold transition-colors hover:bg-muted"
      >
        Sign In
      </Link>
    </>
  )
}