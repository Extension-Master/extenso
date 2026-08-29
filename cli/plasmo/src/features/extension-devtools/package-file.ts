import { userInfo } from "os"
import { sentenceCase } from "change-case"
import getPackageJson, { type AbbreviatedVersion } from "package-json"

import type { ExtensionManifestV3 } from "@extenso/constants"

import type { PackageManagerInfo } from "~features/helpers/package-manager"

const _generatePackage = async ({
  name = "extenso-extension",
  version = "0.0.1",
  packageManager = {} as PackageManagerInfo
}) => {
  const baseData = {
    name,
    displayName: sentenceCase(name),
    version,
    description: "A basic Extenso extension.",
    author: userInfo().username,

    packageManager: undefined as string | undefined,
    scripts: {
      dev: "extenso dev",
      build: "extenso build",
      package: "extenso package"
    },
    dependencies: {
      "@extenso/cli": "workspace:*",
      react: "*",
      "react-dom": "*"
    } as Record<string, string>,
    devDependencies: {
      "@types/chrome": "*",
      "@types/node": "*",
      "@types/react": "*",
      "@types/react-dom": "*",
      prettier: "*",
      typescript: "*"
    } as Record<string, string>,
    manifest: {
      // permissions: [] as ValidManifestPermission[],
      host_permissions: ["https://*/*"]
    } as Partial<ExtensionManifestV3>
  }

  if (!packageManager || !packageManager.version) {
    delete baseData.packageManager
  } else {
    baseData.packageManager = `${packageManager.name}@${packageManager.version}`
  }

  return baseData
}

export type PackageJSON = Awaited<ReturnType<typeof _generatePackage>> & {
  homepage?: string
  contributors?: string[]
  peerDependencies?: Record<string, string>
}

type GenerateArgs = Parameters<typeof _generatePackage>[0]

export const generatePackage = async (p: GenerateArgs) =>
  (await _generatePackage(p)) as PackageJSON

export const resolveWorkspaceToLatestSemver = async (
  dependencies: Record<string, string>
) => {
  const output = {} as Record<string, string>

  await Promise.all(
    Object.entries(dependencies).map(async ([key, value]) => {
      if (key === "@extenso/cli") {
        output[key] = process.env.APP_VERSION as string
      } else if (value === "workspace:*") {
        try {
          const remotePackageData = (await getPackageJson(key, {
            version: "latest"
          })) as unknown as AbbreviatedVersion
          output[key] = remotePackageData.version
        } catch {
          output[key] = value
        }
      } else {
        output[key] = value
      }
    })
  )

  return output
}
