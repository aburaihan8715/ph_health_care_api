import { IPaginationOptions } from '../app/interface/pagination.interface';
import { paginationHelper } from '../helpers/paginationHelper';

/* eslint-disable @typescript-eslint/no-explicit-any */
class QueryBuilder<T> {
  private conditions: any[] = [];
  private paginationOptions: IPaginationOptions | null = null;
  private sortOptions: Record<string, any> = {};

  constructor(
    private filterOptions: Partial<T>,
    private searchKey?: keyof T,
  ) {}

  applySearch(searchTerm?: string) {
    if (searchTerm && this.searchKey) {
      this.conditions.push({
        [this.searchKey]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      });
    }
    return this;
  }

  applyFilters() {
    const filter = this.filterOptions;

    if (Object.keys(filter).length > 0) {
      this.conditions.push({
        AND: Object.entries(filter).map(([key, value]) => ({
          [key]: { equals: value },
        })),
      });
    }
    return this;
  }

  applyPagination(paginationOptions: IPaginationOptions) {
    this.paginationOptions = paginationOptions;
    return this;
  }

  applySorting() {
    if (
      this.paginationOptions?.sortBy &&
      this.paginationOptions?.sortOrder
    ) {
      this.sortOptions = {
        [this.paginationOptions.sortBy]: this.paginationOptions.sortOrder,
      };
    }
    return this;
  }

  buildWhere() {
    return this.conditions.length > 0 ? { AND: this.conditions } : {};
  }

  buildSort() {
    return this.sortOptions;
  }

  getPagination() {
    if (!this.paginationOptions) return { limit: 0, skip: 0 };
    const { limit, page } = paginationHelper.calculatePagination(
      this.paginationOptions,
    );
    const skip = (page - 1) * limit;
    return { limit, skip };
  }
}

export default QueryBuilder;
