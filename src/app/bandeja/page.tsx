import { InboxView } from "@/components/inbox/inbox-view";
import { getRepositories } from "@/lib/repositories";

export default async function BandejaPage() {
  const repositories = await getRepositories();
  const [items, proposals] = await Promise.all([
    repositories.conversations.getInboxItems(50),
    repositories.proposals.getAll(),
  ]);
  return <InboxView initialItems={items} proposals={proposals} />;
}
