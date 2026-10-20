import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { getEnv } from "./env";

export type VoterSession = {
  ballotSessionId?: string;
  admin?: boolean;
};

export type AdminSession = {
  admin?: boolean;
};

function sessionOptions(): SessionOptions {
  const env = getEnv();
  return {
    password: env.sessionSecret,
    cookieName: "sjacs_pta_session",
    cookieOptions: {
      secure: env.isProduction,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 4,
    },
  };
}

export async function getVoterSession() {
  return getIronSession<VoterSession>(await cookies(), sessionOptions());
}

export async function getAdminSession() {
  return getIronSession<AdminSession>(await cookies(), sessionOptions());
}
