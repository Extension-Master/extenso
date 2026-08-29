import { cLog } from "@extenso/utils/logging"

import { validCommandList } from "~commands"
import { flagHelp } from "~features/helpers/flag"

export const printHeader = () => {
  console.log(`🟣 Extenso v${process.env.APP_VERSION}`)

  console.log("🔴 The Browser Extension Framework")
}

export const printHelp = () => {
  cLog("🟠 CMDS", validCommandList.join(" | "))

  cLog("🟡 OPTS", flagHelp)
}
