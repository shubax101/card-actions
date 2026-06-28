# Card Actions — RemNote Plugin

Adds **Disable** and **Remove** buttons to the flashcard queue, right above "Can't remember".

![buttons shown in queue](https://i.imgur.com/placeholder.png)

## Features

| Button | What it does |
|---|---|
| ⏸ **Disable** | Stops the card from appearing in any queue. Card stays in your notes. Advances to next card automatically. |
| 🗑 **Remove** | Deletes the card permanently. Advances to next card automatically. No confirmation prompt. |
| ↩ **Undo Disable** | Restores the card's previous practice direction. Appears after Disable is pressed. |
| ↩ **Undo Remove** | Recreates the deleted rem in its original folder. Appears after Remove is pressed. ⚠️ Only the question text is restored — nested answer options are lost. |

## Installation (Dev)

```bash
git clone https://github.com/remnoteio/remnote-plugin-template-react.git card-actions
cd card-actions
npm install
npm install @remnote/plugin-sdk@latest
```

Replace these files with the ones from this repo:
- `public/manifest.json`
- `src/index.tsx`
- `src/widgets/card_actions.tsx`

Delete `src/widgets/sample_widget.tsx`.

```bash
npm run dev
```

In RemNote → Settings → Plugins → Build → Develop from localhost → `http://localhost:8080`

## Notes

- Re-enabling a disabled card: open the rem in your notes → click the flashcard icon → change practice direction back to Forward/Both.
- Undo is session-only — if you close the queue or refresh, undo data is cleared.
- Tested on RemNote web. Mobile layout uses wrapping buttons to avoid overflow.
