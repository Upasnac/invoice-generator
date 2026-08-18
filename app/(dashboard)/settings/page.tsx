"use client"

import { useEffect, useState } from "react"
import { Building2Icon, SaveIcon } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function SettingsPage() {
  const supabase = createClient()

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

  useEffect(() => {
    const loadBusiness = async () => {
      setLoading(true)
      setErrorMessage("")

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setErrorMessage("You must be logged in.")
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      if (error) {
        setErrorMessage(error.message)
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

    setSaving(true)
    setMessage("")
    setErrorMessage("")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setErrorMessage("You must be logged in.")
      setSaving(false)
      return
    }

    const businessData = {
      user_id: user.id,
      business_name: businessName,
      email: email || null,
      phone: phone || null,
      address: address || null,
      gst_number: gstNumber || null,
      bank_name: bankName || null,
      bank_account_name: bankAccountName || null,
      bank_account_number: bankAccountNumber || null,
    }

    const { data: existingBusiness, error: findError } =
      await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle()

    if (findError) {
      setErrorMessage(findError.message)
      setSaving(false)
      return
    }

    let error

    if (existingBusiness) {
      const result = await supabase
        .from("businesses")
        .update(businessData)
        .eq("id", existingBusiness.id)

      error = result.error
    } else {
      const result = await supabase
        .from("businesses")
        .insert(businessData)

      error = result.error
    }

    if (error) {
      setErrorMessage(error.message)
      setSaving(false)
      return
    }

    setMessage("Business profile saved successfully.")
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">
          Loading business profile...
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Building2Icon className="size-6" />

            <h1 className="text-2xl font-bold">
              Business Profile
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            These details will appear on your invoices.
          </p>
        </div>

      <form onSubmit={handleSave} className="space-y-6">

  {/* Business Details */}
  <div>
    <h2 className="mb-4 text-lg font-semibold">
      Business Details
    </h2>

    <div className="space-y-4">

      <div className="space-y-2">
        <Label htmlFor="businessName">
          Business Name
        </Label>

        <Input
          id="businessName"
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Enter business name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Business Email
        </Label>

        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter business email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">
          Phone Number
        </Label>

        <Input
          id="phone"
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter phone number"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">
          Business Address
        </Label>

        <textarea
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter business address"
          className="min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gstNumber">
          GST Number
        </Label>

        <Input
          id="gstNumber"
          type="text"
          value={gstNumber}
          onChange={(e) => setGstNumber(e.target.value)}
          placeholder="Enter GST number"
        />
      </div>

    </div>
  </div>


  {/* Bank Details */}
  <div className="border-t pt-6">

    <h2 className="mb-1 text-lg font-semibold">
      Bank Details
    </h2>

    <p className="mb-4 text-sm text-muted-foreground">
      These details will appear on your invoices for payment.
    </p>

    <div className="space-y-4">

      <div className="space-y-2">
        <Label htmlFor="bankName">
          Bank Name
        </Label>

        <Input
          id="bankName"
          type="text"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          placeholder="e.g. ASB Bank"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bankAccountName">
          Account Name
        </Label>

        <Input
          id="bankAccountName"
          type="text"
          value={bankAccountName}
          onChange={(e) => setBankAccountName(e.target.value)}
          placeholder="Enter account name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bankAccountNumber">
          Account Number
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
  </div>


  {/* Messages */}
  {errorMessage && (
    <p className="text-sm text-destructive">
      {errorMessage}
    </p>
  )}

  {message && (
    <p className="text-sm text-green-600">
      {message}
    </p>
  )}


  {/* Save */}
  <div className="flex justify-end border-t pt-6">
    <Button type="submit" disabled={saving}>
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