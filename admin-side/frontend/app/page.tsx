"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layouts/layout";

export default function PageOne() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return <Layout>Redirecting...</Layout>;
}
