"use client"

import {
  useEffect,
  useRef,
  useState,
} from "react"

import {
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Customer = {
  id: string
  business_id: string
  name: string

  company_name: string | null
  email: string | null
  phone: string | null

  address_line1: string | null
  address_line2: string | null
  city: string | null
  postcode: string | null
  country: string | null
}

export default function CustomersPage() {
  const supabase = createClient()

  const [customers, setCustomers] =
    useState<Customer[]>([])

  const [businessId, setBusinessId] =
    useState<string | null>(null)

  const [
    editingCustomer,
    setEditingCustomer,
  ] = useState<Customer | null>(null)

  const [open, setOpen] =
    useState(false)

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [message, setMessage] =
    useState("")

  const [formError, setFormError] =
    useState("")

  // Reference to validation error
  const errorRef =
    useRef<HTMLDivElement | null>(
      null
    )

  // -----------------------------
  // Customer fields
  // -----------------------------

  const [name, setName] =
    useState("")

  const [
    companyName,
    setCompanyName,
  ] = useState("")

  const [email, setEmail] =
    useState("")

  const [phone, setPhone] =
    useState("")

  const [
    addressLine1,
    setAddressLine1,
  ] = useState("")

  const [
    addressLine2,
    setAddressLine2,
  ] = useState("")

  const [city, setCity] =
    useState("")

  const [postcode, setPostcode] =
    useState("")

  const [country, setCountry] =
    useState("New Zealand")

  useEffect(() => {
    loadCustomers()
  }, [])

  // --------------------------------
  // Show validation error
  // --------------------------------

  const showFormError = (
    errorMessage: string
  ) => {
    setFormError(errorMessage)

    // Wait for React to render
    // the error before scrolling.
    setTimeout(() => {
      errorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }, 100)
  }

  // --------------------------------
  // Load Customers
  // --------------------------------

  const loadCustomers = async () => {
    setLoading(true)
    setMessage("")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage(
        "You must be logged in."
      )

      setLoading(false)
      return
    }

    // Find logged-in user's business
    const {
      data: business,
      error: businessError,
    } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()

    if (businessError || !business) {
      setMessage(
        businessError?.message ||
          "Business profile not found."
      )

      setLoading(false)
      return
    }

    setBusinessId(business.id)

    // Load customers
    const { data, error } =
      await supabase
        .from("customers")
        .select("*")
        .eq(
          "business_id",
          business.id
        )
        .order("created_at", {
          ascending: false,
        })

    if (error) {
      setMessage(error.message)
      setCustomers([])
    } else {
      setCustomers(
        (data ?? []) as Customer[]
      )
    }

    setLoading(false)
  }

  // --------------------------------
  // Reset Form
  // --------------------------------

  const resetForm = () => {
    setName("")
    setCompanyName("")
    setEmail("")
    setPhone("")

    setAddressLine1("")
    setAddressLine2("")

    setCity("")
    setPostcode("")
    setCountry("New Zealand")

    setEditingCustomer(null)

    setFormError("")
  }

  // --------------------------------
  // Add Customer
  // --------------------------------

  const openAddCustomer = () => {
    resetForm()
    setOpen(true)
  }

  // --------------------------------
  // Edit Customer
  // --------------------------------

  const openEditCustomer = (
    customer: Customer
  ) => {
    setEditingCustomer(customer)

    setName(customer.name || "")

    setCompanyName(
      customer.company_name || ""
    )

    setEmail(
      customer.email || ""
    )

    setPhone(
      customer.phone || ""
    )

    setAddressLine1(
      customer.address_line1 || ""
    )

    setAddressLine2(
      customer.address_line2 || ""
    )

    setCity(
      customer.city || ""
    )

    setPostcode(
      customer.postcode || ""
    )

    setCountry(
      customer.country ||
        "New Zealand"
    )

    setFormError("")

    setOpen(true)
  }

  // --------------------------------
  // Save Customer
  // --------------------------------

  const handleSaveCustomer = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    setFormError("")
    setMessage("")

    // -----------------------------
    // Business validation
    // -----------------------------

    if (!businessId) {
      showFormError(
        "Business profile not found."
      )

      return
    }

    // -----------------------------
    // Customer Name
    // Required
    // -----------------------------

    if (!name.trim()) {
      showFormError(
        "Customer name is required."
      )

      return
    }

    if (name.trim().length < 2) {
      showFormError(
        "Customer name must be at least 2 characters."
      )

      return
    }

    // -----------------------------
    // Email
    // Optional
    // -----------------------------

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (
      email.trim() &&
      !emailPattern.test(
        email.trim()
      )
    ) {
      showFormError(
        "Please enter a valid email address."
      )

      return
    }

    // -----------------------------
    // Phone
    // Optional
    // -----------------------------

    if (phone.trim()) {
      const phoneDigits =
        phone.replace(/\D/g, "")

      if (phoneDigits.length < 7) {
        showFormError(
          "Please enter a valid phone number."
        )

        return
      }
    }

    // -----------------------------
    // Address Line 1
    // -----------------------------

    if (!addressLine1.trim()) {
      showFormError(
        "Address Line 1 is required."
      )

      return
    }

    // -----------------------------
    // City
    // -----------------------------

    if (!city.trim()) {
      showFormError(
        "City is required."
      )

      return
    }

    // -----------------------------
    // Postcode
    // -----------------------------

    if (!postcode.trim()) {
      showFormError(
        "Postcode is required."
      )

      return
    }

    // -----------------------------
    // Country
    // -----------------------------

    if (!country.trim()) {
      showFormError(
        "Country is required."
      )

      return
    }

    // -----------------------------
    // NZ postcode validation
    // -----------------------------

    if (
      country
        .trim()
        .toLowerCase() ===
        "new zealand" &&
      !/^\d{4}$/.test(
        postcode.trim()
      )
    ) {
      showFormError(
        "New Zealand postcodes must contain 4 digits."
      )

      return
    }

    // -----------------------------
    // Save
    // -----------------------------

    setSaving(true)

    const customerData = {
      business_id: businessId,

      name: name.trim(),

      company_name:
        companyName.trim() ||
        null,

      email:
        email.trim() ||
        null,

      phone:
        phone.trim() ||
        null,

      address_line1:
        addressLine1.trim(),

      address_line2:
        addressLine2.trim() ||
        null,

      city: city.trim(),

      postcode:
        postcode.trim(),

      country:
        country.trim(),
    }

    let error

    // --------------------------------
    // Update Existing Customer
    // --------------------------------

    if (editingCustomer) {
      const result =
        await supabase
          .from("customers")
          .update(customerData)
          .eq(
            "id",
            editingCustomer.id
          )
          .eq(
            "business_id",
            businessId
          )

      error = result.error
    }

    // --------------------------------
    // Create New Customer
    // --------------------------------

    else {
      const result =
        await supabase
          .from("customers")
          .insert(customerData)

      error = result.error
    }

    // --------------------------------
    // Database Error
    // --------------------------------

    if (error) {
      showFormError(
        error.message
      )

      setSaving(false)

      return
    }

    // --------------------------------
    // Success
    // --------------------------------

    resetForm()

    setOpen(false)

    setSaving(false)

    await loadCustomers()
  }

  // --------------------------------
  // Delete Customer
  // --------------------------------

  const handleDelete = async (
    id: string
  ) => {
    if (!businessId) return

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this customer?"
      )

    if (!confirmed) return

    setMessage("")

    const { error } =
      await supabase
        .from("customers")
        .delete()
        .eq("id", id)
        .eq(
          "business_id",
          businessId
        )

    if (error) {
      setMessage(
        error.message
      )

      return
    }

    await loadCustomers()
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Customers
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage customers used on
            your invoices.
          </p>
        </div>

        {/* Customer Dialog */}
        <Dialog
          open={open}
          onOpenChange={(value) => {
            setOpen(value)

            if (!value) {
              resetForm()
            }
          }}
        >
          <DialogTrigger
            render={
              <Button
                onClick={
                  openAddCustomer
                }
              >
                <PlusIcon className="mr-2 size-4" />

                Add Customer
              </Button>
            }
          />

          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingCustomer
                  ? "Edit Customer"
                  : "Add Customer"}
              </DialogTitle>

              <DialogDescription>
                {editingCustomer
                  ? "Update the customer details."
                  : "Enter the customer details that should appear on invoices."}
              </DialogDescription>
            </DialogHeader>

            {/* Validation Error */}
            {formError && (
              <div
                ref={errorRef}
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {formError}
              </div>
            )}

            <form
              onSubmit={
                handleSaveCustomer
              }
            >
              <div className="grid gap-4 py-4">
                {/* Customer Name */}
                <div className="grid gap-2">
                  <Label htmlFor="name">
                    Customer Name *
                  </Label>

                  <Input
                    id="name"
                    value={name}
                    onChange={(e) =>
                      setName(
                        e.target.value
                      )
                    }
                    placeholder="e.g. Alex Johnson"
                  />
                </div>

                {/* Company Name */}
                <div className="grid gap-2">
                  <Label htmlFor="company">
                    Company Name
                  </Label>

                  <Input
                    id="company"
                    value={companyName}
                    onChange={(e) =>
                      setCompanyName(
                        e.target.value
                      )
                    }
                    placeholder="e.g. ABC Solutions Ltd"
                  />

                  <p className="text-xs text-muted-foreground">
                    Optional
                  </p>
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Email */}
                  <div className="grid gap-2">
                    <Label htmlFor="email">
                      Email
                    </Label>

                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(
                          e.target.value
                        )
                      }
                      placeholder="e.g. alex@example.com"
                    />

                    <p className="text-xs text-muted-foreground">
                      Optional
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="grid gap-2">
                    <Label htmlFor="phone">
                      Phone
                    </Label>

                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) =>
                        setPhone(
                          e.target.value
                        )
                      }
                      placeholder="e.g. 021 123 4567"
                    />

                    <p className="text-xs text-muted-foreground">
                      Optional
                    </p>
                  </div>
                </div>

                {/* Address Line 1 */}
                <div className="grid gap-2">
                  <Label htmlFor="address1">
                    Address Line 1 *
                  </Label>

                  <Input
                    id="address1"
                    value={addressLine1}
                    onChange={(e) =>
                      setAddressLine1(
                        e.target.value
                      )
                    }
                    placeholder="e.g. 25 Example Street"
                  />
                </div>

                {/* Address Line 2 */}
                <div className="grid gap-2">
                  <Label htmlFor="address2">
                    Address Line 2
                  </Label>

                  <Input
                    id="address2"
                    value={addressLine2}
                    onChange={(e) =>
                      setAddressLine2(
                        e.target.value
                      )
                    }
                    placeholder="e.g. Unit 4"
                  />

                  <p className="text-xs text-muted-foreground">
                    Optional
                  </p>
                </div>

                {/* City + Postcode */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* City */}
                  <div className="grid gap-2">
                    <Label htmlFor="city">
                      City *
                    </Label>

                    <Input
                      id="city"
                      value={city}
                      onChange={(e) =>
                        setCity(
                          e.target.value
                        )
                      }
                      placeholder="e.g. Christchurch"
                    />
                  </div>

                  {/* Postcode */}
                  <div className="grid gap-2">
                    <Label htmlFor="postcode">
                      Postcode *
                    </Label>

                    <Input
                      id="postcode"
                      value={postcode}
                      onChange={(e) =>
                        setPostcode(
                          e.target.value
                        )
                      }
                      placeholder="e.g. 8011"
                      inputMode="numeric"
                    />
                  </div>
                </div>

                {/* Country */}
                <div className="grid gap-2">
                  <Label htmlFor="country">
                    Country *
                  </Label>

                  <Input
                    id="country"
                    value={country}
                    onChange={(e) =>
                      setCountry(
                        e.target.value
                      )
                    }
                    placeholder="e.g. New Zealand"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  onClick={() => {
                    setOpen(false)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingCustomer
                      ? "Update Customer"
                      : "Save Customer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Page-level Error */}
      {message && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {message}
        </div>
      )}

      {/* Customer Table */}
      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                Name
              </TableHead>

              <TableHead>
                Company
              </TableHead>

              <TableHead>
                Email
              </TableHead>

              <TableHead>
                Phone
              </TableHead>

              <TableHead>
                City
              </TableHead>

              <TableHead className="text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-28 text-center text-muted-foreground"
                >
                  Loading customers...
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-28 text-center text-muted-foreground"
                >
                  No customers yet. Add
                  your first customer.
                </TableCell>
              </TableRow>
            ) : (
              customers.map(
                (customer) => (
                  <TableRow
                    key={
                      customer.id
                    }
                  >
                    <TableCell className="font-medium">
                      {customer.name}
                    </TableCell>

                    <TableCell>
                      {customer.company_name ||
                        "—"}
                    </TableCell>

                    <TableCell>
                      {customer.email ||
                        "—"}
                    </TableCell>

                    <TableCell>
                      {customer.phone ||
                        "—"}
                    </TableCell>

                    <TableCell>
                      {customer.city ||
                        "—"}
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {/* Edit */}
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          title="Edit customer"
                          onClick={() =>
                            openEditCustomer(
                              customer
                            )
                          }
                        >
                          <PencilIcon className="size-4" />
                        </Button>

                        {/* Delete */}
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          title="Delete customer"
                          onClick={() =>
                            handleDelete(
                              customer.id
                            )
                          }
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              )
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}