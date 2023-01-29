# What does it do?

- Prevents the main chat input from losing focus when players join your lobby or switch slots.
- Fixes a bug where your chat history doesn't automatically scroll down. (This might cause your chat to look bigger/smaller than before)
- Adds back the `Your friend FRIEND entered a Warcraft III The Frozen Throne game called GAME` messages. (Might not always work, blizzard doesn't always tell us when friends join a game)

# Installation

Open: `C:\Program Files (x86)\Warcraft III\_retail_\webui\index.html` (Might be a lil different on your computer)
Look for the line: `<script src="GlueManager.js"></script>`
Prepend it with: `<script src="https://w3replayers.com/wc3-ui-edits.js"></script>` (The order matters so make sure you prepend it)

Should look something like below: (Might look a little different if you're using W3C, make sure you dont overwrite the entire file otherwise W3C no longer works)

```
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>Warcraft 3 UI</title>
        <meta name="viewport" content="width=device-width, minimum-scale=1.0, initial-scale=1.0, minimal-ui" />
        <script>
            window.__DEBUG = new Boolean('').valueOf();
        </script>
    </head>
    <body>
        <div id="root"></div>
        <div id="portal"></div>
        <script src="https://w3replayers.com/wc3-ui-edits.js"></script>
        <script src="GlueManager.js"></script>
    </body>
</html>
```
