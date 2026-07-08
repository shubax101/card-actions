import { renderWidget, usePlugin } from '@remnote/plugin-sdk';
import { useState } from 'react';

interface UndoDisableData {
  remId: string;
  prevDirection: string;
}

interface UndoRemoveData {
  text: any[];
  parentId: string;
}

function CardActionsWidget() {
  const plugin = usePlugin();
  const [undoDisable, setUndoDisable] = useState<UndoDisableData | null>(null);
  const [undoRemove, setUndoRemove] = useState<UndoRemoveData | null>(null);

  async function disableCard() {
    try {
      const card = await plugin.queue.getCurrentCard();
      if (!card) { await plugin.app.toast('No card found'); return; }
      const rem = await plugin.rem.findOne(card.remId);
      if (!rem) { await plugin.app.toast('Could not find rem'); return; }
      const prev = await rem.getPracticeDirection();
      setUndoDisable({ remId: card.remId, prevDirection: prev ?? 'forward' });
      setUndoRemove(null);
      await rem.setPracticeDirection('none');
      await plugin.queue.removeCurrentCardFromQueue(false);
      await plugin.app.toast('Card disabled ✓');
    } catch (e: any) {
      await plugin.app.toast('Error disabling: ' + e.message);
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
      const rem = await plugin.rem.findOne(card.remId);
      if (!rem) { await plugin.app.toast('Could not find rem'); return; }
      setUndoRemove({ text: rem.text as any[], parentId: rem.parent as string });
      setUndoDisable(null);
      await plugin.queue.removeCurrentCardFromQueue(false);
      await rem.remove();
      await plugin.app.toast('Card removed ✓');
    } catch (e: any) {
      await plugin.app.toast('Error removing: ' + e.message);
    }
  }

  async function undoRemoveCard() {
    if (!undoRemove) return;
    try {
      const newRem = await plugin.rem.createRem();
      if (!newRem) return;
      await newRem.setText(undoRemove.text);
      if (undoRemove.parentId) await newRem.setParent(undoRemove.parentId);
      setUndoRemove(null);
      await plugin.app.toast('Card restored ✓');
    } catch (e: any) {
      await plugin.app.toast('Error: ' + e.message);
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
        {undoRemove && (
          <button onClick={undoRemoveCard} style={btn('#1f2937', '#ef4444', '1px solid #ef4444')}>
            ↩ Undo
          </button>
        )}
      </div>
    </div>
  );
}

renderWidget(CardActionsWidget);
