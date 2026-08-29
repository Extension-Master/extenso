import { readJson, writeJson } from "fs-extra"
import getPackageJson, { type AbbreviatedVersion } from "package-json"
import semver from "semver"

import { isAccessible } from "@extenso/utils/fs"
import { aLog, eLog, vLog, wLog } from "@extenso/utils/logging"

import type { CommonPath } from "~features/extension-devtools/common-path"
import { cleanUpDotPlasmo } from "~features/extra/cache-busting"
import { getPackageManager } from "~features/helpers/package-manager"

export const updateVersionFile = async (commonPath: CommonPath) => {
  const { plasmoVersionFilePath } = commonPath

  if (!(await isAccessible(plasmoVersionFilePath))) {
    vLog("Extenso version file not found, busting cache...")
    await cleanUpDotPlasmo(commonPath)
  } else {
    const cachedVersion = await readJson(plasmoVersionFilePath)
    const semverCachedVersion = semver.coerce(cachedVersion.version)
    const semverCurrentVersion = semver.coerce(process.env.APP_VERSION)!

    if (
      !semverCachedVersion ||
      semverCachedVersion.major < semverCurrentVersion.major ||
      (semverCachedVersion.major === semverCurrentVersion.major &&
        semverCachedVersion.minor < semverCurrentVersion.minor)
    ) {
      vLog("Extenso updated, busting cache...")
      await cleanUpDotPlasmo(commonPath)
    }
  }

  await writeJson(plasmoVersionFilePath, { version: process.env.APP_VERSION })
}

export const checkNewVersion = async () => {
  // If the version is different, log a warning about new version is available
  const currentVersion = process.env.APP_VERSION

  // If the version is different, log a warning about new version is available
  try {
    // Get the latest version of @extenso/cli
    const latestPackageJson = (await getPackageJson("@extenso/cli", {
      version: "latest"
    })) as unknown as AbbreviatedVersion
    const latestVersion = latestPackageJson.version

    // If the version is different, log a warning about new version is available
    if (semver.lt(currentVersion, latestVersion)) {
      const { default: chalk } = await import("chalk")
      wLog(
        chalk.yellowBright(
          `A new version of Extenso is available: v${latestVersion}`
        )
      )
      const updateCmd = await getUpdateCmd(latestVersion)
      aLog(chalk.yellow(`Run ${updateCmd} to update`))
    }
  } catch (error) {
    eLog('Error fetching package information for "@extenso/cli"', error)
  }
}

async function getUpdateCmd(version = "") {
  const packageManager = await getPackageManager()
  switch (packageManager.name) {
    case "npm":
      return `"npm i -S @extenso/cli@${version}"`
    case "pnpm":
      return `"pnpm i @extenso/cli@${version}"`
    case "yarn":
      return `"yarn add @extenso/cli@${version}"`
  }
}
