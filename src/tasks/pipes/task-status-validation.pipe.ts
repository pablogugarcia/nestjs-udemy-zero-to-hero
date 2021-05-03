import { BadRequestException, PipeTransform } from '@nestjs/common';
import { TaskStatus } from '../task-status.enum';

export class TaskStatusValidationPipe implements PipeTransform {
  transform(value: string) {
    if (typeof value != 'string') {
      throw new BadRequestException();
    }
    value = value.toUpperCase();
    if (value in TaskStatus) {
      return value;
    } else {
      throw new BadRequestException();
    }
  }
}
