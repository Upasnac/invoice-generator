"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export function BusinessSetupGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkBusiness = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      /*
       * Allow these pages even when business
       * profile does not exist.
       */
      const allowedWithoutBusiness =
        pathname === "/dashboard" || pathname === "/settings";

      if (!business && !allowedWithoutBusiness) {
        router.replace("/settings");
        return;
      }

      setLoading(false);
    };

    checkBusiness();
  }, [pathname, router, supabase]);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
