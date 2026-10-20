export type Locale = "en" | "zh-Hant";

export const LOCALES: Locale[] = ["en", "zh-Hant"];

export const DEFAULT_LOCALE: Locale = "zh-Hant";

type Dict = Record<string, string>;

const en: Dict = {
  "site.title": "SJACS PTA Parent Election",
  "site.subtitle": "St. Joseph's Anglo-Chinese School — Parent-Teacher Association",
  "nav.home": "Home",
  "nav.vote": "Vote",
  "nav.transparency": "Transparency",
  "nav.admin": "Admin",
  "lang.en": "English",
  "lang.zh": "繁體中文",
  "home.requestCode": "Request ballot code",
  "home.email": "Email address",
  "home.submit": "Send code",
  "home.haveCode": "I already have a code",
  "vote.title": "Cast your ballot",
  "vote.code": "Ballot code",
  "vote.primary": "Primary committee (up to 6)",
  "vote.secondary": "Secondary committee (up to 6)",
  "vote.totalHint": "You may select up to 11 candidates in total.",
  "vote.submit": "Submit ballot",
  "vote.success": "Thank you — your ballot has been recorded anonymously.",
  "transparency.title": "Election transparency",
  "transparency.turnout": "Ballots cast",
  "transparency.root": "Commitment root (HMAC)",
  "transparency.codes": "Published ballot codes (election closed)",
  "error.invalidCode": "Invalid or unknown ballot code",
  "error.alreadyVoted": "This code has already been used",
  "error.electionClosed": "Voting is closed",
  "error.electionNotOpen": "Voting is not open yet",
};

const zhHant: Dict = {
  "site.title": "SJACS 家長教師會選舉",
  "site.subtitle": "聖若瑟英文小學 — 家長教師會",
  "nav.home": "主頁",
  "nav.vote": "投票",
  "nav.transparency": "透明度",
  "nav.admin": "管理",
  "lang.en": "English",
  "lang.zh": "繁體中文",
  "home.requestCode": "索取投票代碼",
  "home.email": "電郵地址",
  "home.submit": "發送代碼",
  "home.haveCode": "我已持有代碼",
  "vote.title": "投票",
  "vote.code": "投票代碼",
  "vote.primary": "正選委員（最多 6 位）",
  "vote.secondary": "候選委員（最多 6 位）",
  "vote.totalHint": "合共最多可選 11 位候選人。",
  "vote.submit": "提交選票",
  "vote.success": "多謝 — 您的選票已匿名記錄。",
  "transparency.title": "選舉透明度",
  "transparency.turnout": "已投票數",
  "transparency.root": "承諾根（HMAC）",
  "transparency.codes": "已公布投票代碼（選舉已結束）",
  "error.invalidCode": "代碼無效或不存在",
  "error.alreadyVoted": "此代碼已使用",
  "error.electionClosed": "投票已結束",
  "error.electionNotOpen": "投票尚未開始",
};

const dictionaries: Record<Locale, Dict> = {
  en,
  "zh-Hant": zhHant,
};

export function t(locale: Locale, key: string): string {
  return dictionaries[locale][key] ?? dictionaries.en[key] ?? key;
}

export function parseLocale(value: string | null | undefined): Locale {
  if (value === "en" || value === "zh-Hant") return value;
  return DEFAULT_LOCALE;
}
