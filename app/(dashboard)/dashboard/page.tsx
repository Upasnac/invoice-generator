import Link from "next/link"
import { FileTextIcon, PlusIcon, UsersIcon } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your invoices and customers.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/invoices/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <PlusIcon className="size-4" />
          Create Invoice
        </Link>

        <Link
          href="/invoices"
          className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium"
        >
          <FileTextIcon className="size-4" />
          View Invoices
        </Link>

        <Link
          href="/customers"
          className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium"
        >
          <UsersIcon className="size-4" />
          Customers
        </Link>
      </div>
    </div>
  )
}