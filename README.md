## What does it do?

-   Adds back the `Your friend FRIEND entered a game called GAME` messages. (Does not always work, Blizzard doesn't always tell us when friends join a game)
-   Makes chat messages more compact by removing the profile picture
-   Hides the bottom right player div on the multiplayer screen to create more space for your friendlist
-   Very basic gamelist table fix by forcing long words to break
-   Press ` to see the current activated settings

## Installation

1. Install or update W3Champions as they fix some registry settings required for this mod
2. Open: `C:\Program Files (x86)\Warcraft III\_retail_\webui\index.html` (Might be a little different on your computer)

Replace:

```
<script src="GlueManager.js"></script>
```

with:

```
<div id="root-edits"></div>
<script src="https://w3replayers.com/wc3-ui-edits/assets/index.js"></script>
<link rel="stylesheet" href="https://w3replayers.com/wc3-ui-edits/assets/index.css" />
<script src="GlueManager.js"></script>
```

3. Done 🥳

&nbsp;

### Optional: Disabling certain edits

To disable certain edits you'll have to use the url below and then change specific fixes to `false`

```
<script src="https://w3replayers.com/wc3-ui-edits/assets/index.js?chat=true&friends=true&friendlist=true&breakall=true"></script>
```

&nbsp;

&nbsp;

&nbsp;

## For development

Replace:

```
<script src="GlueManager.js"></script>
<script src="https://ingame-addon.w3champions.com/w3champions.js"
```

with:

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

### For chii support:

Run `yarn chii`

And append this to the index.html:

```
<script src="http://localhost:8080/target.js"></script>
```
