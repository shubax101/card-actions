import { declareIndexPlugin, ReactRNPlugin, WidgetLocation } from '@remnote/plugin-sdk';

async function onActivate(plugin: ReactRNPlugin) {
  await plugin.app.registerWidget('card_actions', WidgetLocation.FlashcardAnswerButtons, {
    dimensions: { height: '60px', width: '100%' },
  });
}

async function onDeactivate() {}

declareIndexPlugin(onActivate, onDeactivate);
