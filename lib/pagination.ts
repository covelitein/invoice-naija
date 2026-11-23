/** Small enough that Documents/Customers pagination appears with demo data. */
export const DEFAULT_PAGE_SIZE = 2;

export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = Math.min(start + pageSize, total);

  return {
    items: items.slice(start, end),
    page: currentPage,
    pageSize,
    total,
    totalPages,
    start: total === 0 ? 0 : start + 1,
    end,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
  };
}
