import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], field: any, value: any): any[] {
    console.log(items,"items");
    console.log(field,"field");
    console.log(value,"value");
    
    if (!items) return [];
    if (!value || value.length === 0) return items;

    return items.filter(item => {
      for (const key in item) {
        if(key==field && item[key].includes(value)){
          return true
        }
      }
      return false;
    });
    // return items.filter(item => item[field] === value);
  }
}