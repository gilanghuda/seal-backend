import { CursorPaginationResult } from 'App/DTO/ChatDTO'


export default class CursorBasedPagination {
  static decodeCursor(cursor: string): string {
    try {
      return Buffer.from(cursor, 'base64').toString('utf-8')
    } catch {
      return ''
    }
  }


  static encodeCursor(id: string): string {
    return Buffer.from(id).toString('base64')
  }

  static buildResult<T>(
    items: T[],
    limit: number,
    idField: keyof T = 'id' as keyof T
  ): CursorPaginationResult<T> {
    const hasMore = items.length > limit
    const data = hasMore ? items.slice(0, limit) : items

    const nextCursor = hasMore && data.length > 0
      ? this.encodeCursor(String(data[data.length - 1][idField]))
      : null

    return {
      data,
      pagination: {
        next_cursor: nextCursor,
        has_more: hasMore,
        limit,
      },
    }
  }

  static getQueryConditions(cursor?: string): { decodedCursor: string | null } {
    const decodedCursor = cursor ? this.decodeCursor(cursor) : null
    return { decodedCursor }
  }
}
