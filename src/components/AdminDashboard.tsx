"use client";

import { useState } from "react";

type Candidate = {
  id: number;
  category: "primary" | "secondary";
  nameEn: string;
  nameZh: string;
  sortOrder: number;
  active: boolean;
};

type Props = {
  initialOpen: boolean;
  turnout: number;
  candidates: Candidate[];
  tallies: { primary: Record<string, number>; secondary: Record<string, number> };
};

export function AdminDashboard({ initialOpen, turnout, candidates, tallies }: Props) {
  const [open, setOpen] = useState(initialOpen);
  const [message, setMessage] = useState("");

  async function toggleElection() {
    const res = await fetch("/api/admin/election", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOpen: !open }),
    });
    if (res.ok) {
      setOpen(!open);
      setMessage(open ? "Election closed" : "Election opened");
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  }

  return (
    <main className="admin-grid" style={{ maxWidth: "56rem", margin: "1.5rem auto" }}>
      <div className="card">
        <h1>SJACS PTA — Admin</h1>
        <p>Turnout (anonymous ballots): <strong>{turnout}</strong></p>
        <p>Election status: <strong>{open ? "OPEN" : "CLOSED"}</strong></p>
        <button type="button" onClick={toggleElection}>
          {open ? "Close election" : "Open election"}
        </button>
        <button type="button" className="secondary" onClick={logout} style={{ marginLeft: "0.5rem" }}>
          Log out
        </button>
        {message && <p className="success">{message}</p>}
      </div>

      <div className="card">
        <h2>Results (live tally)</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Category</th>
              <th>Name (EN)</th>
              <th>Name (ZH)</th>
              <th>Votes</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => {
              const votes =
                c.category === "primary"
                  ? tallies.primary[String(c.id)] ?? 0
                  : tallies.secondary[String(c.id)] ?? 0;
              return (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.category}</td>
                  <td>{c.nameEn}</td>
                  <td>{c.nameZh}</td>
                  <td>{votes}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Add candidate</h2>
        <AddCandidateForm />
      </div>
    </main>
  );
}

function AddCandidateForm() {
  const [category, setCategory] = useState<"primary" | "secondary">("primary");
  const [nameEn, setNameEn] = useState("");
  const [nameZh, setNameZh] = useState("");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, nameEn, nameZh }),
    });
    if (res.ok) {
      setMsg("Added — refresh to see");
      setNameEn("");
      setNameZh("");
    } else {
      setMsg("Failed");
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <label>
        Category
        <select value={category} onChange={(e) => setCategory(e.target.value as "primary" | "secondary")}>
          <option value="primary">primary</option>
          <option value="secondary">secondary</option>
        </select>
      </label>
      <label>
        Name (EN)
        <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} required />
      </label>
      <label>
        Name (ZH)
        <input value={nameZh} onChange={(e) => setNameZh(e.target.value)} required />
      </label>
      <button type="submit">Add</button>
      {msg && <p>{msg}</p>}
    </form>
  );
}
