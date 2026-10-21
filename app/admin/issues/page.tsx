import { adminIssues } from "@/lib/admin";
import { PageHead } from "@/components/admin/AdminShell";
import { Tabs } from "@/components/admin/ui";
import { IssueQueue } from "@/components/admin/IssueQueue";

export const metadata = { title: "Complaints" };

export default async function IssuesPage(props: PageProps<"/admin/issues">) {
  const sp = await props.searchParams;
  const status = typeof sp.status === "string" ? sp.status : "open";
  const all = await adminIssues("all");
  const rows = status === "all" ? all : all.filter((i) => i.status === status);
  const n = (s: string) => all.filter((i) => i.status === s).length;
  return (
    <>
      <PageHead title="Complaints" sub="Item problems are refunded automatically. Late deliveries and other issues wait here for a decision." />
      <Tabs current={status} items={[["open", "Needs action", n("open")], ["refunded", "Refunded", n("refunded")], ["rejected", "Rejected", n("rejected")], ["all", "All", all.length]].map(([k, l, c]) => ({ key: String(k), label: String(l), count: Number(c), href: `/admin/issues?status=${k}` }))} />
      <IssueQueue rows={rows} />
    </>
  );
}
