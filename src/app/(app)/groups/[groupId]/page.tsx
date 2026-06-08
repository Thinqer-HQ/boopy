"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GroupDetailRedirect() {
  const router = useRouter();
  const params = useParams();
  const groupId = typeof params.groupId === "string" ? params.groupId : "";
  useEffect(() => {
    router.replace(groupId ? `/subscriptions?group=${groupId}` : "/subscriptions");
  }, [router, groupId]);
  return null;
}
