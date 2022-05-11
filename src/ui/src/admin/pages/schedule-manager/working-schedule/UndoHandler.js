
import Marionette from 'backbone.marionette';

const NUM_UNDOS_TO_STORE = 10;

const UndoHandler = Marionette.Object.extend({
  initialize() {
    this.undoStack = [];
  },

  clear() {
    this.undoStack = [];
    this.trigger('update');
  },
  
  addChangeItem(change={}) {
    if (!change || !change.revertFn) {
      console.log(`[Error] Undo Change Item added without valid revert function`);
      return;
    }
    // If at max number of undos, remove the oldest to make room for the latest
    if (this.undoStack.length === NUM_UNDOS_TO_STORE) this.undoStack.shift();
    
    this.undoStack.push(change);
    this.trigger('update');
  },

  getNumUndos() {
    return this.undoStack.length;
  },

  hasUndo() {
    return !!this.undoStack.length;
  },

  // Removes latest undo from stack and runs it
  applyLatestUndo() {
    const latest = this.undoStack.pop();

    if (!latest) {
      console.log(`[Warning] No latest undo to perform`);
      return;
    }

    return new Promise((res, rej) => latest.revertFn().then(() => {
      this.trigger('update');
      res();
    }, () => {
      this.trigger('update');
      rej();
    }));
  },

});

export default UndoHandler;