/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js

import { configure } from 'quasar/wrappers'
import path from 'path'
import IconsResolver from 'unplugin-icons/resolver'
import { QuasarResolver } from 'unplugin-vue-components/resolvers'
import { load } from 'js-yaml'

// Import Vite plugins
import vueI18n from '@intlify/unplugin-vue-i18n/vite'
import vueComponents from 'unplugin-vue-components/vite'
import unpluginIcons from 'unplugin-icons/vite'

export default configure(function (/* ctx */) {
  // Define the custom YAML plugin
  const yamlPlugin = {
    name: 'yaml',
    transform(src, id) {
      if (id.endsWith('.yaml') || id.endsWith('.yml')) {
        try {
          const json = load(src)
          if (typeof json !== 'object') {
            return null
          }
          return {
            code: `export default ${JSON.stringify(json)};`,
            map: null
          }
        } catch (e) {
          this.error(`Failed to parse YAML file: ${id}\n${e}`)
        }
      }
      return null
    }
  }

  // Initialize other plugins
  const i18nPlugin = vueI18n({
    runtimeOnly: false,
  })

  const componentsPlugin = vueComponents({
    resolvers: [
      IconsResolver(),
      QuasarResolver(),
    ],
    dts: path.join(__dirname, './src/globals/components.d.ts')
  })

  const iconsPlugin = unpluginIcons()

  return {
    eslint: {
      // fix: true,
      // include: [],
      // exclude: [],
      // rawOptions: {},
      warnings: false,
      errors: false
    },

    // App boot files
    boot: [
      'i18n',
      'notify-defaults'
    ],

    css: [
      'app.scss'
    ],

    extras: [
      'roboto-font',
      'material-icons',
    ],

    build: {
      target: {
        browser: ['es2022', 'edge94', 'firefox93', 'chrome94', 'safari16.4'],
        node: 'node18'
      },

      vueRouterMode: 'hash', // available values: 'hash', 'history'

      rawDefine: {
        APP_COMMIT: JSON.stringify(process.env.COMMIT_HASH || '')
      },

      alias: {
        '@': path.join(__dirname, 'src'),
        composables: path.join(__dirname, 'src/composables'),
      },

      extendViteConf(viteConf) {
        viteConf.plugins = viteConf.plugins || []
        // Add the custom YAML plugin
        viteConf.plugins.push(yamlPlugin)
        // Add other Vite plugins
        viteConf.plugins.push(i18nPlugin)
        viteConf.plugins.push(componentsPlugin)
        viteConf.plugins.push(iconsPlugin)
      },

      // Remove vitePlugins since we're adding them via extendViteConf
      vitePlugins: []
    },

    devServer: {
      port: 3111,
      open: false // disables automatic browser opening
    },

    framework: {
      config: {
        dark: true
      },

      lang: 'en-US',

      plugins: ['Dialog', 'Notify']
    },

    animations: []
  }
})
