import { PipeTransform, Injectable } from '@nestjs/common';
import { IPaginationOptions } from './types/pagination-options';

@Injectable()
export default class ParsePaginationPipe implements PipeTransform {
  transform(
    data: Record<string, unknown> & Partial<IPaginationOptions>,
  ): IPaginationOptions {
    const { page, limit, ...rest } = data;

    let defaultPage = 0;
    let defaultLimit = 20;

    if (Number.isInteger(page) && page >= 0) {
      defaultPage = page;
    }

    if (Number.isInteger(limit) && limit > 0 && limit < 100) {
      defaultLimit = limit;
    }

    return { page: defaultPage, limit: defaultLimit, ...rest };
  }
}
