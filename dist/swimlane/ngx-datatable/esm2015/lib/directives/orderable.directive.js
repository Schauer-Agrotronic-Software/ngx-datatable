import { Directive, Output, EventEmitter, ContentChildren, KeyValueDiffers, Inject } from '@angular/core';
import { DraggableDirective } from './draggable.directive';
import { DOCUMENT } from '@angular/common';
export class OrderableDirective {
  constructor(differs, document) {
    this.document = document;
    this.reorder = new EventEmitter();
    this.targetChanged = new EventEmitter();
    this.differ = differs.find({}).create();
  }
  ngAfterContentInit() {
    // HACK: Investigate Better Way
    this.updateSubscriptions();
    this.draggables.changes.subscribe(this.updateSubscriptions.bind(this));
  }
  ngOnDestroy() {
    this.draggables.forEach(d => {
      d.dragStart.unsubscribe();
      d.dragging.unsubscribe();
      d.dragEnd.unsubscribe();
    });
  }
  updateSubscriptions() {
    const diffs = this.differ.diff(this.createMapDiffs());
    if (diffs) {
      const subscribe = ({ currentValue, previousValue }) => {
        unsubscribe({ previousValue });
        if (currentValue) {
          currentValue.dragStart.subscribe(this.onDragStart.bind(this));
          currentValue.dragging.subscribe(this.onDragging.bind(this));
          currentValue.dragEnd.subscribe(this.onDragEnd.bind(this));
        }
      };
      const unsubscribe = ({ previousValue }) => {
        if (previousValue) {
          previousValue.dragStart.unsubscribe();
          previousValue.dragging.unsubscribe();
          previousValue.dragEnd.unsubscribe();
        }
      };
      diffs.forEachAddedItem(subscribe);
      // diffs.forEachChangedItem(subscribe.bind(this));
      diffs.forEachRemovedItem(unsubscribe);
    }
  }
  onDragStart() {
    this.positions = {};
    let i = 0;
    for (const dragger of this.draggables.toArray()) {
      const elm = dragger.element;
      const left = parseInt(elm.offsetLeft.toString(), 0);
      this.positions[dragger.dragModel.prop] = {
        left,
        right: left + parseInt(elm.offsetWidth.toString(), 0),
        index: i++,
        element: elm
      };
    }
  }
  onDragging({ element, model, event }) {
    const prevPos = this.positions[model.prop];
    const target = this.isTarget(model, event);
    if (target) {
      if (this.lastDraggingIndex !== target.i) {
        this.targetChanged.emit({
          prevIndex: this.lastDraggingIndex,
          newIndex: target.i,
          initialIndex: prevPos.index
        });
        this.lastDraggingIndex = target.i;
      }
    } else if (this.lastDraggingIndex !== prevPos.index) {
      this.targetChanged.emit({
        prevIndex: this.lastDraggingIndex,
        initialIndex: prevPos.index
      });
      this.lastDraggingIndex = prevPos.index;
    }
  }
  onDragEnd({ element, model, event }) {
    const prevPos = this.positions[model.prop];
    const target = this.isTarget(model, event);
    if (target) {
      this.reorder.emit({
        prevIndex: prevPos.index,
        newIndex: target.i,
        model
      });
    }
    this.lastDraggingIndex = undefined;
    element.style.left = 'auto';
  }
  isTarget(model, event) {
    let i = 0;
    const x = event.x || event.clientX;
    const y = event.y || event.clientY;
    const targets = this.document.elementsFromPoint(x, y);
    for (const prop in this.positions) {
      // current column position which throws event.
      const pos = this.positions[prop];
      // since we drag the inner span, we need to find it in the elements at the cursor
      if (model.prop !== prop && targets.find(el => el === pos.element)) {
        return {
          pos,
          i
        };
      }
      i++;
    }
  }
  createMapDiffs() {
    return this.draggables.toArray().reduce((acc, curr) => {
      acc[curr.dragModel.$$id] = curr;
      return acc;
    }, {});
  }
}
OrderableDirective.decorators = [{ type: Directive, args: [{ selector: '[orderable]' }] }];
OrderableDirective.ctorParameters = () => [
  { type: KeyValueDiffers },
  { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT] }] }
];
OrderableDirective.propDecorators = {
  reorder: [{ type: Output }],
  targetChanged: [{ type: Output }],
  draggables: [{ type: ContentChildren, args: [DraggableDirective, { descendants: true }] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JkZXJhYmxlLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi8uLi9wcm9qZWN0cy9zd2ltbGFuZS9uZ3gtZGF0YXRhYmxlL3NyYy8iLCJzb3VyY2VzIjpbImxpYi9kaXJlY3RpdmVzL29yZGVyYWJsZS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLFNBQVMsRUFDVCxNQUFNLEVBQ04sWUFBWSxFQUNaLGVBQWUsRUFFZixlQUFlLEVBR2YsTUFBTSxFQUNQLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQzNELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUczQyxNQUFNLE9BQU8sa0JBQWtCO0lBVzdCLFlBQVksT0FBd0IsRUFBNEIsUUFBYTtRQUFiLGFBQVEsR0FBUixRQUFRLENBQUs7UUFWbkUsWUFBTyxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ2hELGtCQUFhLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUFVOUQsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQzFDLENBQUM7SUFFRCxrQkFBa0I7UUFDaEIsK0JBQStCO1FBQy9CLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBQzNCLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDekUsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUMxQixDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzFCLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxF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Q0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUM7UUFDbkMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFdEQsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2pDLDhDQUE4QztZQUM5QyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRWpDLGlGQUFpRjtZQUNqRixJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssSUFBSSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFPLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ3hFLE9BQU87b0JBQ0wsR0FBRztvQkFDSCxDQUFDO2lCQUNGLENBQUM7YUFDSDtZQUVELENBQUMsRUFBRSxDQUFDO1NBQ0w7SUFDSCxDQUFDO0lBRU8sY0FBYztRQUNwQixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFO1lBQ3BELEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztZQUNoQyxPQUFPLEdBQUcsQ0FBQztRQUNiLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNULENBQUM7OztZQTNJRixTQUFTLFNBQUMsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFOzs7WUFScEMsZUFBZTs0Q0FvQndCLE1BQU0sU0FBQyxRQUFROzs7c0JBVnJELE1BQU07NEJBQ04sTUFBTTt5QkFFTixlQUFlLFNBQUMsa0JBQWtCLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBPdXRwdXQsXG4gIEV2ZW50RW1pdHRlcixcbiAgQ29udGVudENoaWxkcmVuLFxuICBRdWVyeUxpc3QsXG4gIEtleVZhbHVlRGlmZmVycyxcbiAgQWZ0ZXJDb250ZW50SW5pdCxcbiAgT25EZXN0cm95LFxuICBJbmplY3Rcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBEcmFnZ2FibGVEaXJlY3RpdmUgfSBmcm9tICcuL2RyYWdnYWJsZS5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgRE9DVU1FTlQgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuXG5ARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbb3JkZXJhYmxlXScgfSlcbmV4cG9ydCBjbGFzcyBPcmRlcmFibGVEaXJlY3RpdmUgaW1wbGVtZW50cyBBZnRlckNvbnRlbnRJbml0LCBPbkRlc3Ryb3kge1xuICBAT3V0cHV0KCkgcmVvcmRlcjogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEBPdXRwdXQoKSB0YXJnZXRDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICBAQ29udGVudENoaWxkcmVuKERyYWdnYWJsZURpcmVjdGl2ZSwgeyBkZXNjZW5kYW50czogdHJ1ZSB9KVxuICBkcmFnZ2FibGVzOiBRdWVyeUxpc3Q8RHJhZ2dhYmxlRGlyZWN0aXZlPjtcblxuICBwb3NpdGlvbnM6IGFueTtcbiAgZGlmZmVyOiBhbnk7XG4gIGxhc3REcmFnZ2luZ0luZGV4OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoZGlmZmVyczogS2V5VmFsdWVEaWZmZXJzLCBASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIGRvY3VtZW50OiBhbnkpIHtcbiAgICB0aGlzLmRpZmZlciA9IGRpZmZlcnMuZmluZCh7fSkuY3JlYXRlKCk7XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKTogdm9pZCB7XG4gICAgLy8gSEFDSzogSW52ZXN0aWdhdGUgQmV0dGVyIFdheVxuICAgIHRoaXMudXBkYXRlU3Vic2NyaXB0aW9ucygpO1xuICAgIHRoaXMuZHJhZ2dhYmxlcy5jaGFuZ2VzLnN1YnNjcmliZSh0aGlzLnVwZGF0ZVN1YnNjcmlwdGlvbnMuYmluZCh0aGlzKSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmRyYWdnYWJsZXMuZm9yRWFjaChkID0+IHtcbiAgICAgIGQuZHJhZ1N0YXJ0LnVuc3Vic2NyaWJlKCk7XG4gICAgICBkLmRyYWdnaW5nLnVuc3Vic2NyaWJlKCk7XG4gICAgICBkLmRyYWdFbmQudW5zdWJzY3JpYmUoKTtcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZVN1YnNjcmlwdGlvbnMoKTogdm9pZCB7XG4gICAgY29uc3QgZGlmZnMgPSB0aGlzLmRpZmZlci5kaWZmKHRoaXMuY3JlYXRlTWFwRGlmZnMoKSk7XG5cbiAgICBpZiAoZGlmZnMpIHtcbiAgICAgIGNvbnN0IHN1YnNjcmliZSA9ICh7IGN1cnJlbnRWYWx1ZSwgcHJldmlvdXNWYWx1ZSB9OiBhbnkpID0+IHtcbiAgICAgICAgdW5zdWJzY3JpYmUoeyBwcmV2aW91c1ZhbHVlIH0pO1xuXG4gICAgICAgIGlmIChjdXJyZW50VmFsdWUpIHtcbiAgICAgICAgICBjdXJyZW50VmFsdWUuZHJhZ1N0YXJ0LnN1YnNjcmliZSh0aGlzLm9uRHJhZ1N0YXJ0LmJpbmQodGhpcykpO1xuICAgICAgICAgIGN1cnJlbnRWYWx1ZS5kcmFnZ2luZy5zdWJzY3JpYmUodGhpcy5vbkRyYWdnaW5nLmJpbmQodGhpcykpO1xuICAgICAgICAgIGN1cnJlbnRWYWx1ZS5kcmFnRW5kLnN1YnNjcmliZSh0aGlzLm9uRHJhZ0VuZC5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgY29uc3QgdW5zdWJzY3JpYmUgPSAoeyBwcmV2aW91c1ZhbHVlIH06IGFueSkgPT4ge1xuICAgICAgICBpZiAocHJldmlvdXNWYWx1ZSkge1xuICAgICAgICAgIHByZXZpb3VzVmFsdWUuZHJhZ1N0YXJ0LnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgcHJldmlvdXNWYWx1ZS5kcmFnZ2luZy51bnN1YnNjcmliZSgpO1xuICAgICAgICAgIHByZXZpb3VzVmFsdWUuZHJhZ0VuZC51bnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBkaWZmcy5mb3JFYWNoQWRkZWRJdGVtKHN1YnNjcmliZSk7XG4gICAgICAvLyBkaWZmcy5mb3JFYWNoQ2hhbmdlZEl0ZW0oc3Vic2NyaWJlLmJpbmQodGhpcykpO1xuICAgICAgZGlmZnMuZm9yRWFjaFJlbW92ZWRJdGVtKHVuc3Vic2NyaWJlKTtcbiAgICB9XG4gIH1cblxuICBvbkRyYWdTdGFydCgpOiB2b2lkIHtcbiAgICB0aGlzLnBvc2l0aW9ucyA9IHt9O1xuXG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3QgZHJhZ2dlciBvZiB0aGlzLmRyYWdnYWJsZXMudG9BcnJheSgpKSB7XG4gICAgICBjb25zdCBlbG0gPSBkcmFnZ2VyLmVsZW1lbnQ7XG4gICAgICBjb25zdCBsZWZ0ID0gcGFyc2VJbnQoZWxtLm9mZnNldExlZnQudG9TdHJpbmcoKSwgMCk7XG4gICAgICB0aGlzLnBvc2l0aW9uc1tkcmFnZ2VyLmRyYWdNb2RlbC5wcm9wXSA9IHtcbiAgICAgICAgbGVmdCxcbiAgICAgICAgcmlnaHQ6IGxlZnQgKyBwYXJzZUludChlbG0ub2Zmc2V0V2lkdGgudG9TdHJpbmcoKSwgMCksXG4gICAgICAgIGluZGV4OiBpKyssXG4gICAgICAgIGVsZW1lbnQ6IGVsbVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBvbkRyYWdnaW5nKHsgZWxlbWVudCwgbW9kZWwsIGV2ZW50IH06IGFueSk6IHZvaWQge1xuICAgIGNvbnN0IHByZXZQb3MgPSB0aGlzLnBvc2l0aW9uc1ttb2RlbC5wcm9wXTtcbiAgICBjb25zdCB0YXJnZXQgPSB0aGlzLmlzVGFyZ2V0KG1vZGVsLCBldmVudCk7XG5cbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICBpZiAodGhpcy5sYXN0RHJhZ2dpbmdJbmRleCAhPT0gdGFyZ2V0LmkpIHtcbiAgICAgICAgdGhpcy50YXJnZXRDaGFuZ2VkLmVtaXQoe1xuICAgICAgICAgIHByZXZJbmRleDogdGhpcy5sYXN0RHJhZ2dpbmdJbmRleCxcbiAgICAgICAgICBuZXdJbmRleDogdGFyZ2V0LmksXG4gICAgICAgICAgaW5pdGlhbEluZGV4OiBwcmV2UG9zLmluZGV4XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmxhc3REcmFnZ2luZ0luZGV4ID0gdGFyZ2V0Lmk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLmxhc3REcmFnZ2luZ0luZGV4ICE9PSBwcmV2UG9zLmluZGV4KSB7XG4gICAgICB0aGlzLnRhcmdldENoYW5nZWQuZW1pdCh7XG4gICAgICAgIHByZXZJbmRleDogdGhpcy5sYXN0RHJhZ2dpbmdJbmRleCxcbiAgICAgICAgaW5pdGlhbEluZGV4OiBwcmV2UG9zLmluZGV4XG4gICAgICB9KTtcbiAgICAgIHRoaXMubGFzdERyYWdnaW5nSW5kZXggPSBwcmV2UG9zLmluZGV4O1xuICAgIH1cbiAgfVxuXG4gIG9uRHJhZ0VuZCh7IGVsZW1lbnQsIG1vZGVsLCBldmVudCB9OiBhbnkpOiB2b2lkIHtcbiAgICBjb25zdCBwcmV2UG9zID0gdGhpcy5wb3NpdGlvbnNbbW9kZWwucHJvcF07XG5cbiAgICBjb25zdCB0YXJnZXQgPSB0aGlzLmlzVGFyZ2V0KG1vZGVsLCBldmVudCk7XG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgdGhpcy5yZW9yZGVyLmVtaXQoe1xuICAgICAgICBwcmV2SW5kZXg6IHByZXZQb3MuaW5kZXgsXG4gICAgICAgIG5ld0luZGV4OiB0YXJnZXQuaSxcbiAgICAgICAgbW9kZWxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMubGFzdERyYWdnaW5nSW5kZXggPSB1bmRlZmluZWQ7XG4gICAgZWxlbWVudC5zdHlsZS5sZWZ0ID0gJ2F1dG8nO1xuICB9XG5cbiAgaXNUYXJnZXQobW9kZWw6IGFueSwgZXZlbnQ6IGFueSk6IGFueSB7XG4gICAgbGV0IGkgPSAwO1xuICAgIGNvbnN0IHggPSBldmVudC54IHx8IGV2ZW50LmNsaWVudFg7XG4gICAgY29uc3QgeSA9IGV2ZW50LnkgfHwgZXZlbnQuY2xpZW50WTtcbiAgICBjb25zdCB0YXJnZXRzID0gdGhpcy5kb2N1bWVudC5lbGVtZW50c0Zyb21Qb2ludCh4LCB5KTtcblxuICAgIGZvciAoY29uc3QgcHJvcCBpbiB0aGlzLnBvc2l0aW9ucykge1xuICAgICAgLy8gY3VycmVudCBjb2x1bW4gcG9zaXRpb24gd2hpY2ggdGhyb3dzIGV2ZW50LlxuICAgICAgY29uc3QgcG9zID0gdGhpcy5wb3NpdGlvbnNbcHJvcF07XG5cbiAgICAgIC8vIHNpbmNlIHdlIGRyYWcgdGhlIGlubmVyIHNwYW4sIHdlIG5lZWQgdG8gZmluZCBpdCBpbiB0aGUgZWxlbWVudHMgYXQgdGhlIGN1cnNvclxuICAgICAgaWYgKG1vZGVsLnByb3AgIT09IHByb3AgJiYgdGFyZ2V0cy5maW5kKChlbDogYW55KSA9PiBlbCA9PT0gcG9zLmVsZW1lbnQpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgcG9zLFxuICAgICAgICAgIGlcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgaSsrO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlTWFwRGlmZnMoKTogeyBba2V5OiBzdHJpbmddOiBEcmFnZ2FibGVEaXJlY3RpdmUgfSB7XG4gICAgcmV0dXJuIHRoaXMuZHJhZ2dhYmxlcy50b0FycmF5KCkucmVkdWNlKChhY2MsIGN1cnIpID0+IHtcbiAgICAgIGFjY1tjdXJyLmRyYWdNb2RlbC4kJGlkXSA9IGN1cnI7XG4gICAgICByZXR1cm4gYWNjO1xuICAgIH0sIHt9KTtcbiAgfVxufVxuIl19
