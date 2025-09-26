import { useState, useEffect, useMemo } from 'react';

// Custom hook for virtualizing large lists
export const useVirtualization = ({
  items = [],
  itemHeight = 50,
  containerHeight = 400,
  overscan = 5
}) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + overscan, items.length);
    
    return {
      start: Math.max(0, start - overscan),
      end
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      ...item,
      index: visibleRange.start + index
    }));
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  const handleScroll = (event) => {
    setScrollTop(event.target.scrollTop);
  };

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    containerProps: {
      style: {
        height: containerHeight,
        overflow: 'auto'
      },
      onScroll: handleScroll
    }
  };
};

export default useVirtualization;
