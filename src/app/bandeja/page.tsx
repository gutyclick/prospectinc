import { InboxView } from "@/components/inbox/inbox-view";
import { requireOwner } from "@/lib/auth/require-owner";
import { conversationRepository, proposalRepository } from "@/lib/repositories";

export default async function BandejaPage() {
  await requireOwner();
  const [items, proposals] = await Promise.all([
    conversationRepository.getInboxItems(50),
    proposalRepository.getAll(),
  ]);
  return <InboxView initialItems={items} proposals={proposals} />;
}
