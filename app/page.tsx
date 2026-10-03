import Link from "next/link"

import {
 BarChart3Icon,
  CheckCircle2Icon,
  FileTextIcon,
  ReceiptTextIcon,
  Settings2Icon,
  ShieldCheckIcon,
  UsersIcon,
  
  WalletCardsIcon,
} from "lucide-react"

import { LandingAuthButtons } from "@/components/landing-auth-buttons"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* =========================
          NAVBAR
      ========================== */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ReceiptTextIcon className="size-5" />
            </div>

            <span className="text-lg font-bold">
              Invoice Manager
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-7 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              How It Works
            </a>
          </nav>

          {/* Login / Dashboard Buttons */}
          <LandingAuthButtons location="navbar" />
        </div>
      </header>

      {/* =========================
          HERO
      ========================== */}
      <section className="relative overflow-hidden border-b">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:px-8 lg:py-28">
          {/* Hero Content */}
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-sm text-muted-foreground">
              <CheckCircle2Icon className="size-4 text-primary" />
              Simple invoicing for small businesses
            </div>

            <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Create professional invoices{" "}
              <span className="text-primary">
                without the hassle.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
  Create invoices, manage customers, calculate GST,
  track payments and generate professional PDFs
  from one simple dashboard — with a flexible setup
  that can adapt to your business requirements.
</p>
            </p>

            {/* Dynamic Auth Buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LandingAuthButtons location="hero" />
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2Icon className="size-4 text-green-600" />
                Easy setup
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2Icon className="size-4 text-green-600" />
                GST ready
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2Icon className="size-4 text-green-600" />
                PDF invoices
              </div>
            </div>
          </div>

          {/* =========================
              PRODUCT MOCKUP
          ========================== */}
          <div className="relative">
            <div className="absolute -inset-8 -z-10 rounded-full bg-primary/5 blur-3xl" />

            <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl">
              {/* Mock App Header */}
              <div className="flex items-center justify-between border-b px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="size-2.5 rounded-full bg-muted-foreground/30" />
                  <div className="size-2.5 rounded-full bg-muted-foreground/30" />
                  <div className="size-2.5 rounded-full bg-muted-foreground/30" />
                </div>

                <span className="text-xs text-muted-foreground">
                  Dashboard
                </span>
              </div>

              <div className="p-5 sm:p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">
                      Dashboard
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Invoice overview
                    </p>
                  </div>

                  <div className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">
                    + Create Invoice
                  </div>
                </div>

                {/* Mock Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-[10px] text-muted-foreground sm:text-xs">
                      Total Invoiced
                    </p>

                    <p className="mt-2 text-sm font-bold sm:text-lg">
                      $8,450
                    </p>
                  </div>

                  <div className="rounded-lg border p-3">
                    <p className="text-[10px] text-muted-foreground sm:text-xs">
                      Paid
                    </p>

                    <p className="mt-2 text-sm font-bold text-green-600 sm:text-lg">
                      $6,200
                    </p>
                  </div>

                  <div className="rounded-lg border p-3">
                    <p className="text-[10px] text-muted-foreground sm:text-xs">
                      Unpaid
                    </p>

                    <p className="mt-2 text-sm font-bold text-amber-600 sm:text-lg">
                      $2,250
                    </p>
                  </div>
                </div>

                {/* Mock Recent Invoices */}
                <div className="mt-5 rounded-lg border">
                  <div className="border-b px-4 py-3">
                    <p className="text-sm font-semibold">
                      Recent Invoices
                    </p>
                  </div>

                  <div className="divide-y">
                    <MockInvoice
                      number="261003"
                      customer="Northside Studio"
                      amount="$1,250.00"
                      status="Paid"
                    />

                    <MockInvoice
                      number="261002"
                      customer="Green & Co"
                      amount="$850.00"
                      status="Unpaid"
                    />

                    <MockInvoice
                      number="261001"
                      customer="ABC Solutions"
                      amount="$2,400.00"
                      status="Paid"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          FEATURES
      ========================== */}
      <section
        id="features"
        className="py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-primary">
              EVERYTHING YOU NEED
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Keep your invoicing simple
            </h2>

            <p className="mt-4 text-muted-foreground">
              Manage the important parts of your
              invoicing workflow without complicated
              accounting software.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={
                <FileTextIcon className="size-5" />
              }
              title="Professional Invoices"
              description="Create clean invoices with item dates, descriptions, quantities, pricing and payment details."
            />

            <FeatureCard
              icon={
                <UsersIcon className="size-5" />
              }
              title="Customer Management"
              description="Save customer details once and reuse them whenever you create a new invoice."
            />

            <FeatureCard
              icon={
                <WalletCardsIcon className="size-5" />
              }
              title="GST Calculations"
              description="Handle GST-inclusive or GST-exclusive pricing with automatic calculations."
            />

            <FeatureCard
              icon={
                <BarChart3Icon className="size-5" />
              }
              title="Payment Tracking"
              description="Mark invoices as paid or unpaid and see your totals directly from the dashboard."
            />

            <FeatureCard
              icon={
                <ReceiptTextIcon className="size-5" />
              }
              title="PDF Invoices"
              description="Generate clean, printable invoices that can be saved as PDF and shared with customers."
            />

            <FeatureCard
              icon={
                <ShieldCheckIcon className="size-5" />
              }
              title="Your Business Details"
              description="Store your business, GST and bank information so it appears consistently on invoices."
            />
            <FeatureCard
  icon={
    <Settings2Icon className="size-5" />
  }
  title="Flexible for Your Business"
  description="Adapt invoice details, GST settings, payment information and customer details to suit your business requirements."
/>
          </div>
        </div>
      </section>

      {/* =========================
          HOW IT WORKS
      ========================== */}
      <section
        id="how-it-works"
        className="border-y bg-muted/30 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-primary">
              HOW IT WORKS
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              From setup to invoice in minutes
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-4">
            <Step
              number="01"
              title="Set up your business"
              description="Add your business, GST and payment details."
            />

            <Step
              number="02"
              title="Add a customer"
              description="Save the customer information you need for invoicing."
            />

            <Step
              number="03"
              title="Create an invoice"
              description="Add invoice items, GST, dates, notes and payment status."
            />

            <Step
              number="04"
              title="Save as PDF"
              description="Preview your professional invoice and save or print it."
            />
          </div>
        </div>
      </section>

      {/* =========================
          CTA
      ========================== */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-2xl bg-primary px-6 py-12 text-center text-primary-foreground shadow-lg sm:px-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to create your first invoice?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80">
              Set up your business, add your customers
              and start creating professional invoices
              from one simple dashboard.
            </p>

            <LandingAuthButtons location="cta" />
          </div>
        </div>
      </section>

      {/* =========================
          FOOTER
      ========================== */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ReceiptTextIcon className="size-4" />
            </div>

            Invoice Manager
          </Link>

          <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
            <Link
              href="/privacy"
              className="hover:text-foreground"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="hover:text-foreground"
            >
              Terms
            </Link>

            <Link
              href="/login"
              className="hover:text-foreground"
            >
              Sign In
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Invoice Manager
          </p>
        </div>
      </footer>
    </main>
  )
}

/* =========================
   FEATURE CARD
========================== */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>

      <h3 className="mt-5 font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

/* =========================
   HOW IT WORKS STEP
========================== */

function Step({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div>
      <div className="text-4xl font-bold text-primary/20">
        {number}
      </div>

      <h3 className="mt-3 font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

/* =========================
   MOCK INVOICE ROW
========================== */

function MockInvoice({
  number,
  customer,
  amount,
  status,
}: {
  number: string
  customer: string
  amount: string
  status: "Paid" | "Unpaid"
}) {
  return (
    <div className="grid grid-cols-[1fr_1.5fr_1fr] items-center gap-2 px-4 py-3 text-xs sm:grid-cols-[1fr_2fr_1fr_1fr]">
      <span className="font-medium">
        {number}
      </span>

      <span className="truncate text-muted-foreground">
        {customer}
      </span>

      <span className="hidden text-right font-medium sm:block">
        {amount}
      </span>

      <div className="text-right">
        <span
          className={
            status === "Paid"
              ? "inline-flex rounded-full bg-green-100 px-2 py-1 text-[10px] font-medium text-green-700"
              : "inline-flex rounded-full bg-amber-100 px-2 py-1 text-[10px] font-medium text-amber-700"
          }
        >
          {status}
        </span>
      </div>
    </div>
  )
}