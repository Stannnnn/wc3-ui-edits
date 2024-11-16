## What does it do?

-   Adds back the `Your friend FRIEND entered a game called GAME` messages. (Does not always work, Blizzard doesn't always tell us when friends join a game)

## Installation

### Step 1

1.  Open: `C:\Program Files (x86)\Warcraft III\_retail_\webui\index.html` (Might be a little different on your computer)
2.  Look for the line: `<script src="GlueManager.js"></script>`

Replace:

```
<script src="GlueManager.js"></script>
```

with:

```
<div id="root-edits"></div>
<script src="https://w3replayers.com/wc3-ui-edits/assets/index.js"></script>
<link rel="stylesheet" href="https://w3replayers.com/wc3-ui-edits/assets/index.css" />
<script defer src="GlueManager.js"></script>
```

3. Add `defer` to `GlueManager.js` and `w3champions.js`

```
<script defer src="GlueManager.js"></script>
<script defer src="https://ingame-addon.w3champions.com/w3champions.js"></script>
```

### Step 2

If you've used W3Champions or another mod before you're done. If you haven't then you'll have to enable Local Files. You can do this by following the next steps:

1. Open regedit.exe
2. Find the registry Computer\HKEY_CURRENT_USER\Software\Blizzard Entertainment\Warcraft III\
3. Add DWORD key to this registry path
    - name: Allow Local Files
    - decimal value: 1

-   A more detailed explanation can be found here: https://www.hiveworkshop.com/threads/local-files.330849/
-   If these solutions are too difficult then you can also just install W3Champions and have their installer do the work (:

### For development:

```
<div id="root-edits"></div>
<script type="module">
    import RefreshRuntime from "http://localhost:5173/@react-refresh";
    RefreshRuntime.injectIntoGlobalHook(window);
    window.$RefreshReg$ = () => {};
    window.$RefreshSig$ = () => (type) => type;
    window.__vite_plugin_react_preamble_installed__ = true;
</script>
<script type="module" src="http://localhost:5173/@vite/client"></script>
<script type="module" src="http://localhost:5173/src/main.tsx"></script>
<script defer src="GlueManager.js"></script>
<script defer src="https://ingame-addon.w3champions.com/w3champions.js"></script>
```
