import { eq } from "drizzle-orm";
import { createDb, getSchemaTables } from "../src/db";

const sampleCandidates = [
  { category: "primary" as const, nameEn: "Alice Chan", nameZh: "陳愛麗", sortOrder: 1 },
  { category: "primary" as const, nameEn: "Ben Wong", nameZh: "黃本", sortOrder: 2 },
  { category: "primary" as const, nameEn: "Carol Lee", nameZh: "李卡羅", sortOrder: 3 },
  { category: "secondary" as const, nameEn: "David Ho", nameZh: "何大偉", sortOrder: 1 },
  { category: "secondary" as const, nameEn: "Eva Lam", nameZh: "林伊娃", sortOrder: 2 },
];

async function main() {
  const db = createDb();
  const { candidates, electionSettings } = getSchemaTables();

  const existing = await db.select().from(candidates).limit(1);
  if (existing.length === 0) {
    await db.insert(candidates).values(sampleCandidates);
    console.log("Seeded sample candidates");
  }

  await db.update(electionSettings).set({ isOpen: true });
  const settings = await db.select().from(electionSettings).limit(1);
  if (settings.length === 0) {
    await db.insert(electionSettings).values({ isOpen: true });
  }

  console.log("Election marked open for local dev");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
