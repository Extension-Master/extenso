import { createQuestId } from "mnemonic-id"

import { getNonFlagArgvs } from "@extenso/utils/argv"
import { vLog } from "@extenso/utils/logging"

import { quickPrompt } from "~features/helpers/prompt"

export const getRawName = async () => {
  const [rawNameNonInteractive] = getNonFlagArgvs("init")

  if (!!rawNameNonInteractive) {
    vLog("Using user-provided name:", rawNameNonInteractive)
    return rawNameNonInteractive
  }

  vLog("Prompting for the extension name")
  return await quickPrompt("Extension name:", createQuestId())
}
