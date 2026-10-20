import { NextResponse } from "next/server";
import { buildTransparencyPayload } from "@/lib/transparency";
import { getAllBallotCodes, getElectionOpen, getTurnout } from "@/lib/election";
import { getEnv } from "@/lib/env";

export async function GET() {
  const env = getEnv();
  const open = await getElectionOpen();
  const turnout = await getTurnout();
  const codes = await getAllBallotCodes();
  const payload = buildTransparencyPayload(
    env.transparencyCommitmentSecret,
    codes,
    turnout,
    open,
  );
  return NextResponse.json(payload);
}
