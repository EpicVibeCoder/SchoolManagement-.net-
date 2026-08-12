"use client";

type ListPaginationProps = {
      page: number;
      totalPages: number;
      total: number;
      pageSize: number;
      onPageChange: (page: number) => void;
};

export default function ListPagination({ page, totalPages, total, pageSize, onPageChange }: ListPaginationProps) {
      if (total === 0) return null;

      const currentPage = Math.min(page, totalPages);
      const from = (currentPage - 1) * pageSize + 1;
      const to = Math.min(currentPage * pageSize, total);

      return (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                  <p className="text-(--color-ink-soft)">
                        Showing {from}–{to} of {total}
                  </p>
                  <div className="flex items-center gap-2">
                        <button
                              type="button"
                              className="sm-btn sm-btn-secondary"
                              disabled={currentPage <= 1}
                              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        >
                              Previous
                        </button>
                        <span className="text-(--color-ink-soft)">
                              Page {currentPage} of {totalPages}
                        </span>
                        <button
                              type="button"
                              className="sm-btn sm-btn-secondary"
                              disabled={currentPage >= totalPages}
                              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        >
                              Next
                        </button>
                  </div>
            </div>
      );
}
