# reproduce-vite-error-when-building-css-with-watch

We encountered the following error while running
`vite build --mode development --watch` with vite:4.4.9:

```
rendering chunks (114)...[vite:manifest] Plugin error - Unable to get file name for unknown file "a768f517"
```

## Debugging

### Initial Watch Call

The initial call to `watch` (defined in rollup/src/watch/watch-proxy.ts:10)
has the following outputs set:

```json
[
  {
    "dir": "/reproduce/dist",
    "format": "system",
    "exports": "auto",
    "sourcemap": false,
    "generatedCode": "es2015",
    "entryFileNames": "assets/[name]-legacy-[hash].js",
    "chunkFileNames": "assets/[name]-legacy-[hash].js",
    "assetFileNames": "assets/[name]-[hash].[ext]",
    "inlineDynamicImports": false
  },
  {
    "dir": "/reproduce/dist",
    "format": "es",
    "exports": "auto",
    "sourcemap": false,
    "generatedCode": "es2015",
    "entryFileNames": "assets/[name]-[hash].js",
    "chunkFileNames": "assets/[name]-[hash].js",
    "assetFileNames": "assets/[name]-[hash].[ext]",
    "inlineDynamicImports": false
  }
]
```

The callee is `build` in vite/src/node/build.ts:659.

### The timeline of the build

1.  A FileEmitter, let's call this instance FileEmitter(0), is constructed with
    an undefined base emitter.
2.  A FileEmitter, let's call this instance FileEmitter(1), is constructed with
    FileEmitter(0) as base emitter.
3.  A FileEmitter, let's call this instance FileEmitter(2), is constructed with
    FileEmitter(0) as base emitter.
4.  Vite clears `generatedAssets` as part of the `renderStart`
    function of the `vite:asset` plugin. Let's call the configuration, for which
    the cleaning occurred, config(1), since it is the first distinct config
    value that we encountered.
5.  If the `buildStart` function of the `vite:asset` plugin is renamed to
    `renderStart`, vite will clear `generatedAssets` for key config(1) one
    more time.
6.  FileEmitter(2) gets referenceId "d31f18fc" assigned for file "script.css"
7.  ReferenceId "d31f18fc" (src/script.css) is added to `generatedAssets` with
    key config(1) from the `renderChunk` function of the `vite:post-css` plugin
8.  FileEmitter(2).getFileName gets successfully called with referenceId "rd31f18fc"
    from inside `renderChunk` of the `vite:post-css` plugin.
9.  FileEmitter(2) gets referenceId "380b7b38" assigned for file "styles.css"
10. ReferenceId "380b7b38" (src/styles.css) is added to `generatedAssets` with
    key config(1) from the `renderChunk` function of the `vite:post-css` plugin
11. FileEmitter(2).getFileName is successfully called with referenceId
    "380b7b38" from inside `renderChunk` of the `vite:post-css` plugin.
12. `generateBundle` of the `vite:manifest` plugin is executed.
    `generatedAssets` holds two entries for key config(1):
    "d31f18fc" (src/script.css) and "380b7b38" (src/styles.css)
    `generateBundle` issues calls to FileEmitter(2).getFileName for both
    entries.
13. `generateBundle` of the `vite:manifest` plugin is executed.
    `generatedAssets` holds two entries for key config(1):
    "d31f18fc" (src/script.css) and "380b7b38" (src/styles.css)
    `generateBundle` issues calls to FileEmitter(1).getFileName for both
    entries. However, there are no entries in FileEmitter(1), thus the calls
    fail.
