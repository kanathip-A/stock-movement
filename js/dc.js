// Minimal stand-in for the DCLogic base class the original app was written against.
// State merges immediately; the view re-renders once per frame.
export class DCLogic {
  constructor(props = {}) {
    this.props = props;
    this._render = null;
    this._queued = false;
  }
  setState(patch, cb) {
    const next = typeof patch === 'function' ? patch(this.state, this.props) : patch;
    if (next) this.state = { ...this.state, ...next };
    this._schedule();
    if (cb) queueMicrotask(() => { try { cb(); } catch (e) { console.error(e); } });
  }
  forceUpdate() { this._schedule(); }
  _schedule() {
    if (this._queued || !this._render) return;
    this._queued = true;
    requestAnimationFrame(() => { this._queued = false; this._render(); });
  }
}
