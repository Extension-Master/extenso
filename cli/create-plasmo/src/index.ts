#!/usr/bin/env node
import { argv, exit } from "process"
import { version } from "@extenso/cli/package.json"
import init from "@extenso/cli/src/commands/init"

import { ErrorMessage } from "@extenso/constants/error"
import { aLog, eLog } from "@extenso/utils/logging"
import { exitCountDown } from "@extenso/utils/wait"

process.env.APP_VERSION = version

async function main() {
  try {
    // In case someone pasted an essay into the cli
    if (argv.length > 10) {
      throw new Error(ErrorMessage.TooManyArg)
    }

    argv.splice(2, 0, "init")

    await init()
  } catch (e) {
    eLog((e as Error).message || ErrorMessage.Unknown)
    aLog(e.stack)
    await exitCountDown(3)
    exit(1)
  }
}

main()

process.on("SIGINT", () => exit(0))
process.on("SIGTERM", () => exit(0))
