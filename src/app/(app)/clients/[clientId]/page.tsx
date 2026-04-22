import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ clientId: string }>;
};

export default async function ClientDetailPageRedirect({ params }: Props) {
  await params;
  redirect("/groups");
}
