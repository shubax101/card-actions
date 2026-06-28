import { renderWidget, usePlugin } from '@remnote/plugin-sdk';

function CardActionsWidget() {
  const plugin = usePlugin();

  async function disableCard() {
    try {
      const card = await plugin.queue.getCurrentCard();
      if (!card) {
        await plugin.app.toast('No card found');
        return;
      }
      const rem = await plugin.rem.findOne(card.remId);
      if (!rem) {
        await plugin.app.toast('Could not find rem');
        return;
      }
      await rem.setPracticeDirection('none');
      await plugin.app.toast('Card disabled ✓');
    } catch (e: any) {
      await plugin.app.toast('Error: ' + e.message);
    }
  }

  async function removeCard() {
    try {
      const card = await plugin.queue.getCurrentCard();
      if (!card) {
        await plugin.app.toast('No card found');
        return;
      }
      const rem = await plugin.rem.findOne(card.remId);
      if (!rem) {
        await plugin.app.toast('Could not find rem');
        return;
      }
      const confirmed = await plugin.app.confirm(
        'Delete this card and its content permanently? This cannot be undone.'
      );
      if (!confirmed) return;
      await rem.remove();
      await plugin.app.toast('Card removed ✓');
    } catch (e: any) {
      await plugin.app.toast('Error: ' + e.message);
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        padding: '8px 16px',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <button
        onClick={disableCard}
        style={{
          padding: '10px 24px',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          background: '#f59e0b',
          color: '#000',
          flex: 1,
          maxWidth: '200px',
        }}
      >
        ⏸ Disable Card
      </button>
      <button
        onClick={removeCard}
        style={{
          padding: '10px 24px',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          background: '#ef4444',
          color: '#fff',
          flex: 1,
          maxWidth: '200px',
        }}
      >
        🗑 Remove Card
      </button>
    </div>
  );
}

renderWidget(CardActionsWidget);
