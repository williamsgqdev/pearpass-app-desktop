const fs = require('fs')
const path = require('path')
const pkg = require('./package.json')
const appName = pkg.productName ?? pkg.name
const { isWindows } = require('which-runtime')


let packagerConfig = {
  icon: path.join(__dirname, 'assets', 'win32', 'icon'),
  protocols: [{ name: appName, schemes: [pkg.name] }],
  derefSymlinks: true
}

/** @type {import('@electron-forge/shared-types').ForgeConfig} */
module.exports = {
  packagerConfig,

  makers:  [
    {
      name: '@electron-forge/maker-msix',
      config: {
        manifestVariables: {
          publisher: 'CN=&quot;Tether Operations, SA de CV&quot;, O=&quot;Tether Operations, SA de CV&quot;, L=San Salvador, C=SV, SERIALNUMBER=2025120324, OID.2.5.4.15=Private Organization, OID.1.3.6.1.4.1.311.60.2.1.3=SV', 
        },
        windowsSignOptions: {
          certificateSha1: '874b95fdc8a490a3d3bab28643902948b2c7ad43',
          timestampServer: 'http://timestamp.digicert.com'
        }
      }
    }
  ],

  hooks: {
    preMake: async () => {
      fs.rmSync(path.join(__dirname, 'out', 'make'), { recursive: true, force: true })

      const manifest = path.join(__dirname, 'build', 'AppxManifest.xml')
      const msixVersion = pkg.version.replace(/^(\d+\.\d+\.\d+)$/, '$1.0')
      const xml = fs.readFileSync(manifest, 'utf-8')
      fs.writeFileSync(manifest, xml.replace(/Version="[^"]*"/, `Version="${msixVersion}"`))
    },
    postMake: async (forgeConfig, results) => {
      for (const result of results) {
        if (result.platform !== 'win32') continue
        for (const artifact of result.artifacts) {
          if (!artifact.endsWith('.msix')) continue
          // Place Windows artifact in a stable path for pear-build:
          // ./out/PearPass (directory name must match appName)
          const standardDir = path.join(__dirname, 'out', appName)
          fs.mkdirSync(standardDir, { recursive: true })
          const dest = path.join(standardDir, path.basename(artifact))
          fs.renameSync(artifact, dest)
          result.artifacts[result.artifacts.indexOf(artifact)] = dest
        }
      }
      if (isWindows) {
        fs.rmSync(path.join(__dirname, 'out', 'make'), { recursive: true, force: true })
      }
    }
  },

  plugins: [
    {
      name: 'electron-forge-plugin-universal-prebuilds',
      config: {}
    },
    {
      name: 'electron-forge-plugin-prune-prebuilds',
      config: {}
    }
  ]
}

