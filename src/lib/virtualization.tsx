import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface VirtualListProps {
  rowCount: number;
  rowHeight: number;
  height: number;
  overscan?: number;
  renderRow: (index: number) => React.ReactNode;
  className?: string;
  scrollToIndex?: number | null;
}

/**
 * Lightweight virtualization component that only renders the currently visible rows.
 */
export const VirtualList = memo(function VirtualList({
  rowCount,
  rowHeight,
  height,
  overscan = 4,
  renderRow,
  className,
  scrollToIndex = null,
}: VirtualListProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const totalHeight = rowCount * rowHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endIndex = Math.min(rowCount, Math.ceil((scrollTop + height) / rowHeight) + overscan);
  const items = useMemo(() => {
    const rows: React.ReactNode[] = [];
    for (let index = startIndex; index < endIndex; index += 1) {
      rows.push(
        <div key={index} style={{ position: 'absolute', top: index * rowHeight, height: rowHeight, left: 0, right: 0 }}>
          {renderRow(index)}
        </div>,
      );
    }
    return rows;
  }, [endIndex, renderRow, rowHeight, startIndex]);

  const onScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  useEffect(() => {
    if (scrollToIndex === null || scrollToIndex === undefined) {
      return;
    }
    const node = containerRef.current;
    if (!node) {
      return;
    }
    node.scrollTo({ top: scrollToIndex * rowHeight, behavior: 'smooth' });
  }, [rowHeight, scrollToIndex]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', height, overflowY: 'auto' }}
      onScroll={onScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>{items}</div>
    </div>
  );
});
