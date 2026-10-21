import type { Metadata } from "next";
import { currentUser } from "@/lib/auth";
import { listAddresses } from "@/lib/account";
import { TitleBar } from "@/components/ui/TitleBar";
import { LoginPrompt } from "@/components/account/AccountBits";
import { AddressBook } from "@/components/account/AddressBook";
import { serviceability } from "@/lib/geo";

export const metadata: Metadata = { title: "Saved addresses" };

export default async function AddressesPage() {
  const user = await currentUser();
  if (!user) return (<><TitleBar title="Saved addresses" back="/account" /><LoginPrompt /></>);
  const rows = (await listAddresses(user)).map((a) => ({ ...a, serviceable: serviceability(a.lat, a.lng).ok }));
  return (<><TitleBar title="Saved addresses" back="/account" /><AddressBook initial={rows} /></>);
}
