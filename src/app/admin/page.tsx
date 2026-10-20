import { AdminDashboard } from "@/components/AdminDashboard";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { getAdminSession } from "@/lib/session";
import {
  getActiveCandidates,
  getAllBallotSelections,
  getElectionOpen,
  getTurnout,
} from "@/lib/election";
import { tallyVotes } from "@/lib/voting";

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session.admin) {
    return (
      <main style={{ maxWidth: "28rem", margin: "2rem auto" }}>
        <div className="card">
          <h1>SJACS PTA — Admin</h1>
          <AdminLoginForm />
        </div>
      </main>
    );
  }

  const open = await getElectionOpen();
  const turnout = await getTurnout();
  const candidates = await getActiveCandidates();
  const ballots = await getAllBallotSelections();
  const tallies = tallyVotes(ballots);

  return (
    <AdminDashboard
      initialOpen={open}
      turnout={turnout}
      candidates={candidates.map((c) => ({
        id: c.id,
        category: c.category as "primary" | "secondary",
        nameEn: c.nameEn,
        nameZh: c.nameZh,
        sortOrder: c.sortOrder,
        active: c.active,
      }))}
      tallies={{
        primary: Object.fromEntries(tallies.primary),
        secondary: Object.fromEntries(tallies.secondary),
      }}
    />
  );
}
