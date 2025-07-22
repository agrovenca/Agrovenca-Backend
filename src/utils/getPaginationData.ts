export const getPaginationData = ({
  page,
  totalItems,
  totalPages,
}: {
  page: number
  totalItems: number
  totalPages: number
}) => {
  return {
    page: page,
    totalItems: totalItems,
    totalPages: totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    previousPage: page > 1 ? page - 1 : null,
  }
}
