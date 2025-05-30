#!/usr/bin/env node

import * as parser from "./command-parser";
import * as execute from "./command-executor";
import * as chalk from "chalk";

const MAX_STACK_LINES = 6;

export function printDetailedError(err: unknown): void {
  const isVerbose = process.argv.includes('--verbose');
  const red    = (txt: string) => chalk.redBright.bold(txt);
  const yellow = (txt: string) => chalk.yellowBright(txt);
  const gray   = (txt: string) => chalk.gray(txt);

  if (!err) {
    console.error(red("✖  Unknown error (no error object)"));
    return;
  }

  // 1️⃣  Normalize error shape, parse JSON if needed
  let errorObj: any = err;
  if (typeof err === "string") {
    try {
      errorObj = JSON.parse(err);
    } catch {
      errorObj = { message: err };
    }
  }

  type AnyObj = Record<string, unknown>;
  let message = "";
  let code: string | number | undefined;
  let stack: string | undefined;
  let extras: AnyObj = {};

  if (errorObj && typeof errorObj === "object") {
    const e = errorObj as AnyObj;
    // axios / fetch error?
    if (e.response && typeof e.response === "object") {
      const r = e.response as AnyObj;
      // code
      if (typeof r.status === "number" || typeof r.status === "string") {
        code = r.status;
      } else if (typeof e.code === "number" || typeof e.code === "string") {
        code = e.code;
      }
      // message
      if (r.data && typeof r.data === "object" && r.data !== null && 'message' in r.data && typeof (r.data as AnyObj).message === "string") {
        message = (r.data as AnyObj).message as string;
      } else if (typeof r.statusText === "string") {
        message = r.statusText;
      } else if (typeof e.message === "string") {
        message = e.message;
      } else {
        message = "HTTP error";
      }
      // stack
      if (r.data && typeof r.data === "object" && r.data !== null && 'stack' in r.data && typeof (r.data as AnyObj).stack === "string") {
        stack = (r.data as AnyObj).stack as string;
      } else if (typeof e.stack === "string") {
        stack = e.stack;
      }
      // extras
      if (r.data && typeof r.data === "object" && r.data !== null) {
        extras = { ...(r.data as AnyObj) };
      }
    } else {
      message = (typeof e.message === "string" ? e.message : "Unhandled error");
      code    = (typeof e.statusCode === "number" || typeof e.statusCode === "string") ? e.statusCode : (typeof e.code === "number" || typeof e.code === "string") ? e.code : undefined;
      stack   = typeof e.stack === "string" ? e.stack : undefined;
      extras  = { ...e };
    }
  }

  /* ── NEW inner-JSON handling ───────────────────────────── */
  if (typeof message === "string" && message.trim().startsWith("{")) {
    try {
      const inner = JSON.parse(message.trim());
      if (inner && typeof inner === "object") {
        if (typeof inner.message === "string") message = inner.message;
        if (typeof inner.stack   === "string") stack   = inner.stack;
        if (inner.code !== undefined)          code    = inner.code as any;
        extras = { ...extras, ...inner };
      }
    } catch { /* not JSON; leave message as-is */ }
  }
  /* ───────────────────────────────────────────────────────── */

  // Remove standard fields from extras
  if (extras) {
    delete extras.message;
    delete extras.stack;
    delete extras.code;
    delete extras.statusCode;
  }

  // 2️⃣  Mandatory headline
  console.error(red(`✖  ${message}`));

  // 3️⃣  Optional metadata
  if (code !== undefined) {
    console.error(yellow(`   Code : ${code}`));
  }

  if (isVerbose) {
    const extraKeys = Object.keys(extras).filter(k => extras[k] !== undefined && extras[k] !== null && extras[k] !== "");
    if (extraKeys.length) {
      console.error(gray(`   Info : ${JSON.stringify(extras, null, 2)}`));
    }
    // 4️⃣  Stack trace (dim, truncated)
    if (stack) {
      const trimmed = stack
        .split("\n")
        .slice(0, MAX_STACK_LINES)
        .join("\n");
      console.error(gray(trimmed));
    }
  } else {
    // Suggest verbose for more details
    console.error(gray('Run with --verbose for more details.'));
  }
}

function run() {
  const command = parser.createCommand();

  if (!command) {
    parser.showHelp(/*showRootDescription*/ false);
    return;
  }

  execute
    .execute(command)
    .catch((error: any): void => {
      printDetailedError(error);
      process.exit(1);
    })
    .done();
}

run();
