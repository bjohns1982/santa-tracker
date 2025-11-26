import { useState, useEffect } from 'react';

interface Family {
  id: string;
  streetNumber: string;
  streetName: string;
  familyName: string;
  order: number;
  children: Array<{ 
    id: string;
    firstName: string;
    specialInstructions?: string | null;
  }>;
}

interface DraggableFamilyListProps {
  families: Family[];
  onReorder: (newOrder: { familyId: string; order: number }[]) => void;
  onFamilyClick?: (family: Family) => void;
}

export default function DraggableFamilyList({ families, onReorder, onFamilyClick }: DraggableFamilyListProps) {
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [draggedOver, setDraggedOver] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchCurrentIndex, setTouchCurrentIndex] = useState<number | null>(null);
  const [sortedFamilies, setSortedFamilies] = useState(
    [...families].sort((a, b) => a.order - b.order)
  );

  // Update sorted families when families prop changes
  useEffect(() => {
    setSortedFamilies([...families].sort((a, b) => a.order - b.order));
  }, [families]);

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDraggedOver(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedItem === null) return;

    const newFamilies = [...sortedFamilies];
    const [removed] = newFamilies.splice(draggedItem, 1);
    newFamilies.splice(dropIndex, 0, removed);

    // Update order values
    const reordered = newFamilies.map((family, index) => ({
      ...family,
      order: index,
    }));

    setSortedFamilies(reordered);

    // Call parent callback
    onReorder(reordered.map((f, i) => ({ familyId: f.id, order: i })));

    setDraggedItem(null);
    setDraggedOver(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedOver(null);
  };

  // Touch event handlers for mobile support
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    e.preventDefault();
    setTouchStartY(e.touches[0].clientY);
    setTouchCurrentIndex(index);
    setDraggedItem(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY === null || touchCurrentIndex === null || draggedItem === null) return;
    
    e.preventDefault();
    const touchY = e.touches[0].clientY;
    
    // Find which item we're over based on touch position
    const elementBelow = document.elementFromPoint(e.touches[0].clientX, touchY);
    if (!elementBelow) return;
    
    // Find the draggable-item parent
    const targetItem = elementBelow.closest('.draggable-item');
    if (targetItem && targetItem !== e.currentTarget) {
      const targetIndex = parseInt(targetItem.getAttribute('data-index') || '-1');
      if (targetIndex >= 0 && targetIndex !== touchCurrentIndex) {
        setDraggedOver(targetIndex);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY === null || touchCurrentIndex === null || draggedItem === null) {
      setTouchStartY(null);
      setTouchCurrentIndex(null);
      setDraggedItem(null);
      setDraggedOver(null);
      return;
    }

    const touchY = e.changedTouches[0].clientY;
    const elementBelow = document.elementFromPoint(e.changedTouches[0].clientX, touchY);
    
    if (elementBelow) {
      const targetItem = elementBelow.closest('.draggable-item');
      
      if (targetItem) {
        const dropIndex = parseInt(targetItem.getAttribute('data-index') || '-1');
        
        if (dropIndex >= 0 && dropIndex !== draggedItem) {
          const newFamilies = [...sortedFamilies];
          const [removed] = newFamilies.splice(draggedItem, 1);
          newFamilies.splice(dropIndex, 0, removed);

          const reordered = newFamilies.map((family, index) => ({
            ...family,
            order: index,
          }));

          setSortedFamilies(reordered);
          onReorder(reordered.map((f, i) => ({ familyId: f.id, order: i })));
        }
      }
    }

    setTouchStartY(null);
    setTouchCurrentIndex(null);
    setDraggedItem(null);
    setDraggedOver(null);
  };

  return (
    <div className="space-y-2">
      {sortedFamilies.map((family, index) => (
        <div
          key={family.id}
          data-index={index}
          draggable={true}
          className={`draggable-item p-3 border-2 rounded-lg transition-all ${
            draggedItem === index
              ? 'opacity-50 border-holiday-red bg-red-50 shadow-lg scale-95'
              : draggedOver === index
              ? 'border-holiday-gold bg-yellow-50 shadow-md scale-105'
              : 'border-gray-200 hover:border-holiday-gold hover:shadow-md'
          }`}
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = 'move';
            handleDragStart(index);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            handleDragOver(e, index);
          }}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          onTouchStart={(e) => handleTouchStart(e, index)}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex justify-between items-start gap-3">
            {/* Drag Handle - More visible hamburger icon */}
            <div 
              className="flex flex-col items-center justify-center cursor-grab active:cursor-grabbing text-gray-500 hover:text-holiday-red pt-1 transition-colors touch-none"
              title="Drag to reorder"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="hover:scale-110 transition-transform">
                <path d="M9 5h2v2H9V5zm0 6h2v2H9v-2zm0 6h2v2H9v-2zm4-12h2v2h-2V5zm0 6h2v2h-2v-2zm0 6h2v2h-2v-2z" />
              </svg>
            </div>
            <div 
              className="flex-1 cursor-pointer"
              onClick={() => onFamilyClick && onFamilyClick(family)}
            >
              <p className="font-semibold hover:text-holiday-red transition-colors">
                The {family.familyName} Family
              </p>
              <p className="text-sm text-gray-600">
                {family.streetNumber} {family.streetName}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Kids: {family.children.map(c => c.firstName).join(', ')}
                {family.children.some(c => c.specialInstructions) && (
                  <span className="ml-2 text-holiday-red">📝</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-holiday-gold text-white px-2 py-1 rounded font-bold">
                #{index + 1}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

