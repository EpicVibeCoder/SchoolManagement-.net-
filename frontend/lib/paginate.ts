export const PAGE_SIZE = 10;

export function paginate<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
      const total = items.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const currentPage = Math.min(page, totalPages);
      const pageItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);
      return { pageItems, totalPages, currentPage, total, pageSize };
}
