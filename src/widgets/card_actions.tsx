import { renderWidget, usePlugin } from '@remnote/plugin-sdk';
import { useState } from 'react';

interface UndoDisableData {
  remId: string;
  prevDirection: string;
}

function CardActionsWidget() {
  const plugin = usePlugin();
  const [undoDisable, setUndoDisable] = useState<UndoDisableData | null>(null);
  const [lastRemoved, setLastRemoved] = useState<string | null>(null);

  // Gets the root question rem (in MCQ, card.remId may be a child answer rem)
  async function getRootRem(remId: string) {
    let rem = await plugin.rem.findOne(remId);
    if (!rem) return null;
    // Walk up until we find a rem that isnt just an answer option
    // i.e. the first rem that has the MCQ powerup or is a document child
    while (rem) {
      const parentId = rem.parent;
      if (!parentId) break;
      const parent = await plugin.rem.findOne(parentId as string);
      if (!parent) break;
      const parentIsDoc = await parent.isDocument();
      if (parentIsDoc) break; // parent is the folder, so rem IS the question
      rem = parent;
    }
    return rem;
  }

  async function disableCard() {
    try {
      const card = await plugin.queue.getCurrentCard();
      if (!card) { await plugin.app.toast('No card found'); return; }
      const rem = await getRootRem(card.remId);
      if (!rem) { await plugin.app.toast('Could not find rem'); return; }
      const prev = await rem.getPracticeDirection();
      setUndoDisable({ remId: rem._id, prevDirection: prev ?? 'forward' });
      await rem.setPracticeDirection('none');
      await plugin.queue.removeCurrentCardFromQueue(false);
      await plugin.app.toast('Card disabled ✓');
    } catch (e: any) {
      await plugin.app.toast('Error: ' + e.message);
    }
  }

  async function undoDisableCard() {
    if (!undoDisable) return;
    try {
      const rem = await plugin.rem.findOne(undoDisable.remId);
      if (!rem) { await plugin.app.toast('Card no longer exists'); return; }
      await rem.setPracticeDirection(undoDisable.prevDirection as any);
      setUndoDisable(null);
      await plugin.app.toast('Undo disable ✓');
    } catch (e: any) {
      await plugin.app.toast('Error: ' + e.message);
    }
  }

  async function removeCard() {
    try {
      const card = await plugin.queue.getCurrentCard();
      if (!card) { await plugin.app.toast('No card found'); return; }
      const rem = await getRootRem(card.remId);
      if (!rem) { await plugin.app.toast('Could not find rem'); return; }

      const remId = rem._id;
      setLastRemoved(remId);
      setUndoDisable(null);

      // Remove FIRST, then advance — avoids race condition
      await rem.remove();

      // Small delay to ensure deletion is registered before queue advances
      await new Promise(r => setTimeout(r, 100));
      await plugin.queue.removeCurrentCardFromQueue(false);

      await plugin.app.toast('Card removed ✓');
    } catch (e: any) {
      await plugin.app.toast('Error removing: ' + e.message);
    }
  }

  const btn = (bg: string, color: string, border?: string): React.CSSProperties => ({
    padding: '10px 0',
    borderRadius: '8px',
    border: border ?? 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    background: bg,
    color,
    flex: 1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none',
  });

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      padding: '6px 12px 10px',
      justifyContent: 'center',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', gap: '6px', flex: 1, minWidth: '140px' }}>
        <button onClick={disableCard} style={btn('#f59e0b', '#000')}>
          ⏸ Disable
        </button>
        {undoDisable && (
          <button onClick={undoDisableCard} style={btn('#1f2937', '#f59e0b', '1px solid #f59e0b')}>
            ↩ Undo
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '6px', flex: 1, minWidth: '140px' }}>
        <button onClick={removeCard} style={btn('#ef4444', '#fff')}>
          🗑 Remove
        </button>
      </div>
    </div>
  );
}

renderWidget(CardActionsWidget);