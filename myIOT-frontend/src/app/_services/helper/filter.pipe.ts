import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterBy'
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], field: string, value: string): any[] {
    if (!items) return [];
    if (!value) return items;
    return items.filter(item => item[field].toLowerCase().includes(value.toLowerCase()));
  }
}
