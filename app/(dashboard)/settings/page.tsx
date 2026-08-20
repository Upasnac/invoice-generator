"use client"

import { useEffect, useState } from "react"
import { Building2Icon, SaveIcon } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const supabase = createClient()
  const router = useRouter()

  const [businessName, setBusinessName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [gstNumber, setGstNumber] = useState("")
  const [bankName, setBankName] = useState("")
  const [bankAccountName, setBankAccountName] = useState("")
  const [bankAccountNumber, setBankAccountNumber] = useState("")

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [message, setMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const showError = (error: string) => {
    setErrorMessage(error)
    setMessage("")

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }, 100)
  }

  useEffect(() => {
    const loadBusiness = async () => {
      setLoading(true)
      setErrorMessage("")
      setMessage("")

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        showError("You must be logged in.")
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      if (error) {
        showError(error.message)
        setLoading(false)
        return
      }

      if (data) {
        setBusinessName(data.business_name || "")
        setEmail(data.email || "")
        setPhone(data.phone || "")
        setAddress(data.address || "")
        setGstNumber(data.gst_number || "")
        setBankName(data.bank_name || "")
        setBankAccountName(data.bank_account_name || "")
        setBankAccountNumber(data.bank_account_number || "")
      }

      setLoading(false)
    }

    loadBusiness()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    setMessage("")
    setErrorMessage("")

    // -----------------------------
    // Validation
    // -----------------------------

    if (!businessName.trim()) {
      showError("Business name is required.")
      return
    }

    if (!email.trim()) {
      showError("Business email is required.")
      return
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailPattern.test(email.trim())) {
      showError("Please enter a valid business email address.")
      return
    }

    if (!phone.trim()) {
      showError("Phone number is required.")
      return
    }

    if (!address.trim()) {
      showError("Business address is required.")
      return
    }

    if (!bankName.trim()) {
      showError("Bank name is required.")
      return
    }

    if (!bankAccountName.trim()) {
      showError("Bank account name is required.")
      return
    }

    if (!bankAccountNumber.trim()) {
      showError("Bank account number is required.")
      return
    }

    setSaving(true)

    // -----------------------------
    // Get logged-in user
    // -----------------------------

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      showError("You must be logged in.")
      setSaving(false)
      return
    }

    // -----------------------------
    // Business data
    // -----------------------------

    const businessData = {
      user_id: user.id,
      business_name: businessName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),

      // GST is optional
      gst_number: gstNumber.trim() || null,

      bank_name: bankName.trim(),
      bank_account_name: bankAccountName.trim(),
      bank_account_number: bankAccountNumber.trim(),
    }

    // -----------------------------
    // Check existing business
    // -----------------------------

    const {
      data: existingBusiness,
      error: findError,
    } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()

    if (findError) {
      showError(findError.message)
      setSaving(false)
      return
    }

    let saveError = null

    // -----------------------------
    // Update or create
    // -----------------------------

    if (existingBusiness) {
      const { error } = await supabase
        .from("businesses")
        .update(businessData)
        .eq("id", existingBusiness.id)

      saveError = error
    } else {
      const { error } = await supabase
        .from("businesses")
        .insert(businessData)

      saveError = error
    }

    if (saveError) {
      showError(saveError.message)
      setSaving(false)
      return
    }

    // -----------------------------
    // Success
    // -----------------------------

    setMessage("Business profile saved successfully.")
    setSaving(false)

   setTimeout(() => {
  router.push("/dashboard")
  router.refresh()
}, 1000)

  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-sm text-muted-foreground">
          Loading business profile...
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Building2Icon className="size-6" />

            <h1 className="text-3xl font-semibold tracking-tight">
              Business Profile
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            These details will appear on your invoices.
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Business Details */}
          <section className="rounded-xl border bg-card p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold">
                Business Details
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Enter the contact details that should appear on your invoices.
              </p>
            </div>

            <div className="space-y-5">
              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="businessName">
                  Business Name *
                </Label>

                <Input
                  id="businessName"
                  type="text"
                  value={businessName}
                  onChange={(e) =>
                    setBusinessName(e.target.value)
                  }
                  placeholder="Enter business name"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Business Email *
                </Label>

                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter business email"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number *
                </Label>

                <Input
                  id="phone"
                  type="text"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  placeholder="Enter phone number"
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">
                  Business Address *
                </Label>

                <textarea
                  id="address"
                  value={address}
                  onChange={(e) =>
                    setAddress(e.target.value)
                  }
                  placeholder="Enter business address"
                  className="min-h-28 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              {/* GST */}
              <div className="space-y-2">
                <Label htmlFor="gstNumber">
                  GST Number
                </Label>

                <Input
                  id="gstNumber"
                  type="text"
                  value={gstNumber}
                  onChange={(e) =>
                    setGstNumber(e.target.value)
                  }
                  placeholder="Enter GST number"
                />

                <p className="text-xs text-muted-foreground">
                  Optional. Leave blank if your business is not GST registered.
                </p>
              </div>
            </div>
          </section>

          {/* Bank Details */}
          <section className="rounded-xl border bg-card p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold">
                Bank Details
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                These details will appear on your invoices for payment.
              </p>
            </div>

            <div className="space-y-5">
              {/* Bank Name */}
              <div className="space-y-2">
                <Label htmlFor="bankName">
                  Bank Name *
                </Label>

                <Input
                  id="bankName"
                  type="text"
                  value={bankName}
                  onChange={(e) =>
                    setBankName(e.target.value)
                  }
                  placeholder="e.g. ASB Bank"
                />
              </div>

              {/* Account Name */}
              <div className="space-y-2">
                <Label htmlFor="bankAccountName">
                  Account Name *
                </Label>

                <Input
                  id="bankAccountName"
                  type="text"
                  value={bankAccountName}
                  onChange={(e) =>
                    setBankAccountName(e.target.value)
                  }
                  placeholder="Enter account name"
                />
              </div>

              {/* Account Number */}
              <div className="space-y-2">
                <Label htmlFor="bankAccountNumber">
                  Account Number *
                </Label>

                <Input
                  id="bankAccountNumber"
                  type="text"
                  value={bankAccountNumber}
                  onChange={(e) =>
                    setBankAccountNumber(e.target.value)
                  }
                  placeholder="e.g. 12-3456-1234567-00"
                />
              </div>
            </div>
          </section>

          {/* Save */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="min-w-48"
            >
              <SaveIcon className="mr-2 size-4" />

              {saving
                ? "Saving..."
                : "Save Business Profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}