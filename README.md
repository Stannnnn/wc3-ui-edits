# What does it do?

-   Prevents the main chat input from losing focus when players join your lobby or switch slots.
-   Fixes a bug where your chat history doesn't automatically scroll down. (This might cause your chat to look bigger/smaller than before)
-   Adds back the `Your friend FRIEND entered a Warcraft III The Frozen Throne game called GAME` messages. (Does not always work, Blizzard doesn't always tell us when friends join a game)

# Installation

## Step 1

Open: `C:\Program Files (x86)\Warcraft III\_retail_\webui\index.html` (Might be a little different on your computer)
Look for the line: `<script src="GlueManager.js"></script>`
Prepend it with: `<script src="https://w3replayers.com/wc3-ui-edits.js"></script>` (The order matters so make sure you prepend it)

Should look something like below: (Might look a little different if you're using W3Champions, make sure you dont overwrite the entire file otherwise W3Champions no longer works)

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

## Step 2

If you've used W3Champions or another mod before you're done. If you haven't then you'll have to enable Local Files. You can do this by following the next steps:

1. Open regedit.exe
2. Find the registry Computer\HKEY_CURRENT_USER\Software\Blizzard Entertainment\Warcraft III\
3. Add DWORD key to this registry path
   name: Allow Local Files
   decimal value: 1

A more detailed explanation can be found here: https://www.hiveworkshop.com/threads/local-files.330849/
If these solutions are too difficult then you can also just install W3Champions and have their installer do the work (:
