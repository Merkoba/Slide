import {EditorView} from "codemirror"
import {EditorState, Compartment, Prec, StateField, StateEffect} from "@codemirror/state"
import {javascript} from "@codemirror/lang-javascript"
import {nord} from "cm6-theme-nord"
import {keymap, lineNumbers, highlightActiveLineGutter, drawSelection, dropCursor, rectangularSelection, crosshairCursor, Decoration} from "@codemirror/view"
import {vscodeKeymap} from "@replit/codemirror-vscode-keymap"
import {indentWithTab, history, defaultKeymap, historyKeymap, copyLineDown, copyLineUp} from "@codemirror/commands"
import {indentUnit, foldGutter, indentOnInput, bracketMatching} from "@codemirror/language"
import {autocompletion, closeBrackets} from "@codemirror/autocomplete"
import {highlightSelectionMatches, searchKeymap, search, selectNextOccurrence} from "@codemirror/search"

window.CM = {
  EditorView,
  EditorState,
  Compartment,
  Prec,
  javascript,
  nord,
  keymap,
  vscodeKeymap,
  indentWithTab,
  indentUnit,
  autocompletion,
  lineNumbers,
  history,
  foldGutter,
  highlightActiveLineGutter,
  drawSelection,
  dropCursor,
  indentOnInput,
  bracketMatching,
  closeBrackets,
  rectangularSelection,
  crosshairCursor,
  defaultKeymap,
  historyKeymap,
  highlightSelectionMatches,
  searchKeymap,
  search,
  selectNextOccurrence,
  copyLineDown,
  copyLineUp,
  StateField,
  StateEffect,
  Decoration,
}