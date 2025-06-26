import { useState } from "react";
import PageNavigation from "@/components/form-builder/page-navigation";

export interface FormPage {
  id: string;
  name: string;
  active: boolean;
  order: number;
}

const initialPages: FormPage[] = [
  { id: "info", name: "Info", active: true, order: 0 },
  { id: "details", name: "Details", active: false, order: 1 },
  { id: "other", name: "Other", active: false, order: 2 },
  { id: "ending", name: "Ending", active: false, order: 3 },
];

export default function FormBuilder() {
  const [pages, setPages] = useState<FormPage[]>(initialPages);

  const activePage = pages.find(page => page.active);

  const handleSetActivePage = (pageId: string) => {
    setPages(prevPages => 
      prevPages.map(page => ({
        ...page,
        active: page.id === pageId
      }))
    );
  };

  const handleReorderPages = (fromIndex: number, toIndex: number) => {
    setPages(prevPages => {
      const newPages = [...prevPages];
      const [movedPage] = newPages.splice(fromIndex, 1);
      newPages.splice(toIndex, 0, movedPage);
      
      // Update order values
      return newPages.map((page, index) => ({
        ...page,
        order: index
      }));
    });
  };

  const handleAddPage = (afterIndex: number) => {
    const newPageId = `page-${Date.now()}`;
    const newPageName = `Page ${pages.length + 1}`;
    
    setPages(prevPages => {
      const newPages = [...prevPages];
      const newPage: FormPage = {
        id: newPageId,
        name: newPageName,
        active: false,
        order: afterIndex + 1
      };
      
      newPages.splice(afterIndex + 1, 0, newPage);
      
      // Update order values for all pages after the insertion point
      return newPages.map((page, index) => ({
        ...page,
        order: index
      }));
    });
  };

  const handleRenamePage = (pageId: string, newName: string) => {
    setPages(prevPages =>
      prevPages.map(page =>
        page.id === pageId ? { ...page, name: newName } : page
      )
    );
  };

  const handleDuplicatePage = (pageId: string) => {
    const pageToDelete = pages.find(p => p.id === pageId);
    if (!pageToDelete) return;

    const newPageId = `${pageId}-copy-${Date.now()}`;
    const newPageName = `${pageToDelete.name} Copy`;
    
    setPages(prevPages => {
      const pageIndex = prevPages.findIndex(p => p.id === pageId);
      const newPages = [...prevPages];
      const newPage: FormPage = {
        id: newPageId,
        name: newPageName,
        active: false,
        order: pageIndex + 1
      };
      
      newPages.splice(pageIndex + 1, 0, newPage);
      
      // Update order values
      return newPages.map((page, index) => ({
        ...page,
        order: index
      }));
    });
  };

  const handleDeletePage = (pageId: string) => {
    if (pages.length <= 1) return; // Don't allow deleting the last page
    
    setPages(prevPages => {
      const pageToDelete = prevPages.find(p => p.id === pageId);
      const filteredPages = prevPages.filter(page => page.id !== pageId);
      
      // If we deleted the active page, make the first page active
      if (pageToDelete?.active && filteredPages.length > 0) {
        filteredPages[0].active = true;
      }
      
      // Update order values
      return filteredPages.map((page, index) => ({
        ...page,
        order: index
      }));
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6" style={{ backgroundColor: '#F9FAFB' }}>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
            Pages
          </h2>

          <PageNavigation
            pages={pages}
            onSetActivePage={handleSetActivePage}
            onReorderPages={handleReorderPages}
            onAddPage={handleAddPage}
            onRenamePage={handleRenamePage}
            onDuplicatePage={handleDuplicatePage}
            onDeletePage={handleDeletePage}
          />
        </div>
      </div>
    </div>
  );
}
