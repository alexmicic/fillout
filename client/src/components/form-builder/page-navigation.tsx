import { useState, useRef } from "react";
import { Plus, MoreVertical, Flag, Edit, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FormPage } from "@/pages/form-builder";

// Duplicate icon component
const Duplicate = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.5 5.5V13.5H5.5V5.5H13.5ZM13.5 4H5.5C4.67 4 4 4.67 4 5.5V13.5C4 14.33 4.67 15 5.5 15H13.5C14.33 15 15 14.33 15 13.5V5.5C15 4.67 14.33 4 13.5 4Z"
      fill="currentColor"
    />
    <path
      d="M2.5 1C1.67 1 1 1.67 1 2.5V10.5C1 11.33 1.67 12 2.5 12H3V10.5H2.5V2.5H10.5V3H12V2.5C12 1.67 11.33 1 10.5 1H2.5Z"
      fill="currentColor"
    />
  </svg>
);

interface PageNavigationProps {
  pages: FormPage[];
  onSetActivePage: (pageId: string) => void;
  onReorderPages: (fromIndex: number, toIndex: number) => void;
  onAddPage: (afterIndex: number) => void;
  onRenamePage: (pageId: string, newName: string) => void;
  onDuplicatePage: (pageId: string) => void;
  onDeletePage: (pageId: string) => void;
}

export default function PageNavigation({
  pages,
  onSetActivePage,
  onReorderPages,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
}: PageNavigationProps) {
  const [hoveredSpaceIndex, setHoveredSpaceIndex] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    pageId: string | null;
  }>({
    visible: false,
    pageId: null,
  });

  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedIndex: -1,
    dragOverIndex: -1,
  });

  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  const activePageId = pages.find(page => page.active)?.id || null;

  const getButtonStyles = (page: FormPage, isActive: boolean) => {
    if (isActive) {
      return {
        background: 'white',
        color: 'black',
        border: '#e5e7eb',
        shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        showThreeDots: true,
      };
    }
    
    return {
      background: 'rgba(156, 163, 175, 0.15)',
      color: '#6b7280',
      border: 'transparent',
      shadow: 'none',
      showThreeDots: false,
    };
  };

  const handlePageClick = (pageId: string) => {
    onSetActivePage(pageId);
  };

  const handleThreeDotsClick = (e: React.MouseEvent, pageId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      visible: !contextMenu.visible || contextMenu.pageId !== pageId,
      pageId: pageId,
    });
  };

  const hideContextMenu = () => {
    setContextMenu({ visible: false, pageId: null });
  };

  const handleDuplicate = (pageId: string) => {
    onDuplicatePage(pageId);
    hideContextMenu();
  };

  const handleDelete = (pageId: string) => {
    onDeletePage(pageId);
    hideContextMenu();
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragState({
      isDragging: true,
      draggedIndex: index,
      dragOverIndex: -1,
    });
    
    // Create a custom drag image
    const dragElement = e.currentTarget.cloneNode(true) as HTMLElement;
    dragElement.style.transform = 'rotate(5deg)';
    dragElement.style.opacity = '0.8';
    document.body.appendChild(dragElement);
    e.dataTransfer.setDragImage(dragElement, 50, 20);
    setTimeout(() => document.body.removeChild(dragElement), 0);
    
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragState.isDragging && dragState.draggedIndex !== index) {
      setDragState(prev => ({
        ...prev,
        dragOverIndex: index,
      }));
    }
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragState.isDragging && dragState.draggedIndex !== index) {
      onReorderPages(dragState.draggedIndex, index);
    }
    setDragState({
      isDragging: false,
      draggedIndex: -1,
      dragOverIndex: -1,
    });
  };

  const handleDragEnd = () => {
    setDragState({
      isDragging: false,
      draggedIndex: -1,
      dragOverIndex: -1,
    });
  };

  return (
    <div className="relative">
      <div className="flex items-center">
        {pages.map((page, index) => {
          const isActive = page.id === activePageId;
          const styles = getButtonStyles(page, isActive);
          
          return (
            <div key={page.id} className="relative flex items-center">
              {/* Page Button */}
              <div className="relative">
                <button
                  draggable
                  onClick={() => handlePageClick(page.id)}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "select-none transition-all duration-300 cursor-move relative",
                    "px-4 py-2 rounded-lg font-medium text-sm border flex items-center justify-center gap-2",
                    "hover:shadow-sm transform hover:scale-[1.02]",
                    dragState.isDragging && dragState.draggedIndex === index && "opacity-30 scale-95 shadow-2xl rotate-2",
                    dragState.dragOverIndex === index && "ring-2 ring-blue-400 ring-opacity-60"
                  )}
                  style={{
                    backgroundColor: styles.background,
                    color: styles.color,
                    borderColor: styles.border,
                    boxShadow: styles.shadow,
                    minWidth: isActive ? 'auto' : '80px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {/* Page icon based on position */}
                  {index === 0 ? (
                    /* First page - info icon with dynamic color */
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7.95835 8.16667H9.00002L9.00002 12.5417M16.7084 9.00001C16.7084 13.2572 13.2572 16.7083 9.00002 16.7083C4.74283 16.7083 1.29169 13.2572 1.29169 9.00001C1.29169 4.74281 4.74283 1.29167 9.00002 1.29167C13.2572 1.29167 16.7084 4.74281 16.7084 9.00001Z" stroke={isActive ? "#F59D0E" : "#8C93A1"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : index === pages.length - 1 ? (
                    /* Last page - checkmark icon with dynamic color */
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.5 6.91667L7.75001 11.5L6.08334 9.83334M16.7083 9.00001C16.7083 13.2572 13.2572 16.7083 9.00001 16.7083C4.74281 16.7083 1.29167 13.2572 1.29167 9.00001C1.29167 4.74281 4.74281 1.29167 9.00001 1.29167C13.2572 1.29167 16.7083 4.74281 16.7083 9.00001Z" stroke={isActive ? "#F59D0E" : "#8C93A1"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    /* Middle pages - document icon with dynamic color */
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.2798 2.29167H4.79168C4.33144 2.29167 3.95834 2.66477 3.95834 3.12501V16.875C3.95834 17.3352 4.33144 17.7083 4.79168 17.7083H15.2083C15.6686 17.7083 16.0417 17.3352 16.0417 16.875V8.05352C16.0417 7.8325 15.9539 7.62054 15.7976 7.46426L10.8691 2.53575C10.7128 2.37947 10.5008 2.29167 10.2798 2.29167Z" stroke={isActive ? "#F59D0E" : "#8C93A1"} strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M7.29166 11.0417H10.2083M7.29166 14.375H12.7083" stroke={isActive ? "#F59D0E" : "#8C93A1"} strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M10.625 2.70833V6.87499C10.625 7.33523 10.9981 7.70833 11.4583 7.70833H15.625" stroke={isActive ? "#F59D0E" : "#8C93A1"} strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  )}
                  <span className="whitespace-nowrap">{page.name}</span>
                  {styles.showThreeDots && (
                    <div
                      onClick={(e) => handleThreeDotsClick(e, page.id)}
                      className="p-1 rounded hover:bg-black/10 transition-colors cursor-pointer"
                      style={{ marginLeft: '8px' }}
                    >
                      <MoreVertical className="w-4 h-4" style={{ color: '#9DA4B2' }} />
                    </div>
                  )}
                </button>

                {/* Context Menu */}
                {contextMenu.visible && contextMenu.pageId === page.id && (
                  <div className="absolute top-full left-0 mt-2 w-56 z-50 origin-top-left divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:divide-gray-700 dark:ring-gray-600">
                    {/* Header */}
                    <div className="px-4 py-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Settings</h3>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={() => {/* Set as first page - not implemented */}}
                        className="text-gray-700 dark:text-gray-300 group flex w-full items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Flag className="mr-3 h-4 w-4 text-blue-500" />
                        Set as first page
                      </button>
                      
                      <button
                        onClick={() => {/* Rename - not implemented */}}
                        className="text-gray-700 dark:text-gray-300 group flex w-full items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Edit className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        Rename
                      </button>
                      
                      <button
                        onClick={() => {/* Copy - not implemented */}}
                        className="text-gray-700 dark:text-gray-300 group flex w-full items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Copy className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        Copy
                      </button>
                      
                      <button
                        onClick={() => handleDuplicate(page.id)}
                        className="text-gray-700 dark:text-gray-300 group flex w-full items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Duplicate className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        Duplicate
                      </button>
                    </div>
                    
                    {/* Separator before Delete */}
                    <div className="border-t border-gray-100 dark:border-gray-700">
                      <div className="py-1">
                        <button
                          onClick={pages.length > 1 ? () => handleDelete(page.id) : undefined}
                          disabled={pages.length <= 1}
                          className={cn(
                            "group flex w-full items-center px-4 py-2 text-sm",
                            pages.length > 1
                              ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                              : "text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50"
                          )}
                        >
                          <Trash2 className="mr-3 h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Hover space after this page (except for last page) */}
              {index < pages.length - 1 && (
                <div 
                  className={cn(
                    "relative flex items-center justify-center transition-all duration-300 h-full min-h-[40px]",
                    hoveredSpaceIndex === index + 0.5 ? "w-14" : "w-5"
                  )}
                  onMouseEnter={() => setHoveredSpaceIndex(index + 0.5)}
                  onMouseLeave={() => setHoveredSpaceIndex(null)}
                >
                  {/* Dashed line in the space between buttons */}
                  <div className="absolute top-1/2 left-0 right-0 h-px border-t-2 border-dashed border-gray-300 dark:border-gray-600" />
                  
                  {/* Plus button appears on hover */}
                  {hoveredSpaceIndex === index + 0.5 && (
                    <button
                      onClick={() => onAddPage(index)}
                      className="w-5 h-5 bg-white hover:bg-gray-50 text-black border border-gray-200 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 relative z-10"
                      aria-label={`Add page after ${page.name}`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Dashed line after last button */}
        <div className="relative flex items-center justify-center w-5 h-full min-h-[40px]">
          <div className="absolute top-1/2 left-0 right-0 h-px border-t-2 border-dashed border-gray-300 dark:border-gray-600" />
        </div>
        
        {/* Add Page Button - Always Active */}
        <button
          onClick={() => onAddPage(pages.length - 1)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200"
          aria-label="Add page"
        >
          <Plus className="w-4 h-4" />
          <span>Add page</span>
        </button>
      </div>

      {/* Click outside to close context menu */}
      {contextMenu.visible && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={hideContextMenu}
        />
      )}
    </div>
  );
}