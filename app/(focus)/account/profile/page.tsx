import type { Metadata } from "next";
import { currentUser } from "@/lib/auth";
import { TitleBar } from "@/components/ui/TitleBar";
import { LoginPrompt } from "@/components/account/AccountBits";
import { ProfileForm } from "@/components/account/ProfileForm";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await currentUser();
  if (!user) return (<><TitleBar title="Profile" back="/account" /><LoginPrompt /></>);
  return (<><TitleBar title="Profile" back="/account" /><ProfileForm name={user.name || ""} email={user.email || ""} phone={user.phone} /></>);
}
