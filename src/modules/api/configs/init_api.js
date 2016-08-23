import { EventEmitter } from 'events';

export default function (provider, reduxStore, actions) {
  const callbacks = new EventEmitter();

  const providerApi = {
    onStory(cb) {
      callbacks.on('story', cb);
      return function stopListening() {
        callbacks.removeListener('story', cb);
      };
    },

    setStories: actions.api.setStories,
    selectStory: actions.api.selectStory,
    setOptions: actions.api.setOptions,
    handleShortcut: actions.shortcuts.handleEvent,
    setQueryParams: actions.api.setQueryParams,

    getQueryParam(key) {
      const { api } = reduxStore.getState();
      if (api.customQueryParams) {
        return api.customQueryParams[key];
      }
      return undefined;
    },
  };

  provider.handleAPI(providerApi);

  // subscribe to redux store and trigger onStory's callback
  let currentKind;
  let currentStory;
  reduxStore.subscribe(function () {
    const { api } = reduxStore.getState();
    if (!api) return;

    if (api.selectedKind === currentKind && api.selectedStory === currentStory) {
      // No change in the selected story so avoid emitting 'story'
      return;
    }

    currentKind = api.selectedKind;
    currentStory = api.selectedStory;
    callbacks.emit('story', api.selectedKind, api.selectedStory);
    // providerApi._onStoryCallback(api.selectedKind, api.selectedStory);
  });
}
