import { useState, useCallback } from 'react';

export function useSelection(items) {
  const [selectedItems, setSelectedItems] = useState([]);

  const toggleSelectItem = useCallback((id) => {
    setSelectedItems(prevSelected =>
      prevSelected.includes(id)
        ? prevSelected.filter(itemId => itemId !== id)
        : [...prevSelected, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.id));
    }
  }, [items, selectedItems]);

  return { selectedItems, toggleSelectItem, toggleSelectAll };
}