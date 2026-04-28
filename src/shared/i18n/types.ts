/**
 * Translation dictionary contract.
 *
 * Every locale must export an object that satisfies this interface. Keys are
 * grouped by surface area (toolbar, tabs, individual tabs, primitives, …).
 * Templates that interpolate values are typed functions — never `{{}}`
 * placeholders.
 *
 * IMPORTANT: do NOT add keys for strings that are part of the GlazeWM YAML
 * schema (config keys, command verbs, regex patterns, key bindings,
 * file paths) or for the brand name. Those stay literal in every language.
 */
export interface Dictionary {
  app: {
    open: string;
    save: string;
    saveAs: string;
    saveAndReload: string;
    settings: string;
    language: string;
    undoTitle: string;
    redoTitle: string;
    undoAria: string;
    redoAria: string;
    historyTitle: (count: number) => string;
    historyAria: string;
    settingsTitle: string;
    loadingConfig: string;
    externalChanged: string;
    externalChangedUnsaved: string;
    reloadFromDisk: string;
    keepMine: string;
    liveMode: string;
    liveModeTooltip: string;
  };
  tabs: {
    general: string;
    layout: string;
    gaps: string;
    effects: string;
    workspaces: string;
    keybindings: string;
    rules: string;
    settings: string;
  };
  general: {
    startupCommands: string;
    shutdownCommands: string;
    configReloadCommands: string;
    behavior: string;
    focusFollowsCursor: string;
    toggleWorkspaceOnRefocus: string;
    cursorJumpEnabled: string;
    showAllInTaskbar: string;
    cursorJumpTrigger: string;
    hideMethod: string;
    placeholderStartup: string;
    placeholderShutdown: string;
    placeholderReload: string;
  };
  gaps: {
    scaleWithDpi: string;
    heading: string;
    description: string;
    screen: string;
    screenAria: string;
    top: string;
    left: string;
    right: string;
    bottom: string;
    inner: string;
    outerTopTitle: string;
    outerLeftTitle: string;
    outerRightTitle: string;
    outerBottomTitle: string;
    innerTitle: string;
  };
  effects: {
    focusedWindow: string;
    otherWindows: string;
    borderEnabled: string;
    borderColor: string;
    hideTitleBar: string;
    cornerStyleEnabled: string;
    cornerStyle: string;
  };
  workspaces: {
    name: string;
    displayName: string;
    bindToMonitor: string;
    keybinding: string;
    namePlaceholder: string;
    nameTitle: string;
    displayNamePlaceholder: string;
    bindToMonitorPlaceholder: string;
    bindToMonitorTitle: string;
    addKeybinding: string;
    removeAria: string;
    commandLabel: string;
    bindingPlaceholder: string;
    add: string;
    syncedNote: string;
    addWorkspace: string;
    removeBindingAria: string;
  };
  keybindings: {
    filterPlaceholder: string;
    clear: string;
    keybindingTitle: (n: number) => string;
    bindings: string;
    commands: string;
    addBinding: string;
    addCommand: string;
    removeKeybinding: string;
    addKeybinding: string;
  };
  rules: {
    filterPlaceholder: string;
    clear: string;
    ruleTitle: (n: number) => string;
    commands: string;
    addCommand: string;
    matchConditions: string;
    conditionTitle: (n: number) => string;
    process: string;
    class: string;
    title: string;
    opEquals: string;
    opIncludes: string;
    opRegex: string;
    opNotEquals: string;
    opNotRegex: string;
    placeholderProcess: string;
    placeholderClass: string;
    placeholderTitle: string;
    pickerPicking: string;
    pickerRegexHint: string;
    pickerSingleHint: (field: string) => string;
    pickerAria: string;
    pickerReplace: (field: string) => string;
    pickerAppend: (field: string) => string;
    fieldNameProcess: string;
    fieldNameClass: string;
    fieldNameTitle: string;
    removeCondition: string;
    addCondition: string;
    removeRule: string;
    addRule: string;
    edit: string;
    done: string;
    anyWindow: string;
  };
  settings: {
    editorBehavior: string;
    autoSortTags: string;
    autoSortTagsHint: string;
    autoSortRaw: string;
    autoSortRawHintBefore: string;
    autoSortRawHintAfter: string;
  };
  picker: {
    process: string;
    class: string;
    title: string;
    other: string;
    uwpWarning: string;
    clickHint: string;
  };
  commandBuilder: {
    build: string;
    raw: string;
    buildTitle: string;
    rawOnlyTitle: string;
    rawTitle: string;
    unrecognized: string;
    removeAria: string;
    viewMode: string;
    pick: string;
    placeholderRaw: string;
    placeholderAmount: string;
    amountTitle: string;
    placeholderText: string;
    textTitle: string;
    placeholderShellRest: string;
  };
  regexTag: {
    tags: string;
    regex: string;
    tagsTitle: string;
    convertTitle: string;
    rawTitle: string;
    convertConfirm: string;
    cantTag: string;
    filterPlaceholder: string;
    filterAria: string;
    removeAria: string;
    noTagsMatch: (q: string) => string;
    showingCount: (visible: number, total: number) => string;
    autoSortHint: string;
    noSortHint: string;
    rawPlaceholder: string;
    viewMode: string;
  };
  keyCapture: {
    pressKey: string;
    cancel: string;
    capture: string;
    placeholder: string;
    removeAria: string;
  };
  history: {
    redoStack: string;
    current: string;
    undoStack: string;
    initialState: string;
    unsaved: string;
    saved: string;
    editGeneral: string;
    editGaps: string;
    editEffects: string;
    editWorkspaces: string;
    editKeybindings: string;
    editRules: string;
  };
  dialogs: {
    removeAria: string;
    add: string;
    clear: string;
  };
  help: {
    menu: string;
    glazewmGitHub: string;
    editorGitHub: string;
    about: string;
    aboutTitle: string;
    version: (v: string) => string;
    madeBy: string;
    license: string;
  };
  status: {
    loaded: (path: string) => string;
    newConfig: (path: string) => string;
    reloaded: (path: string) => string;
    reloadFailed: (err: string) => string;
    saved: (path: string) => string;
    savedReloading: (path: string) => string;
    savedAndReloaded: (out: string) => string;
    saveReloadFailed: (err: string) => string;
    error: (err: string) => string;
  };
}
