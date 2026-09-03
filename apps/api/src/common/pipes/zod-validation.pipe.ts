import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type === 'body') {
      try {
        return this.schema.parse(value);
      } catch (error: any) {
        throw new BadRequestException({
          message: 'Falha na validação de dados',
          errors: error.errors,
        });
      }
    }
    return value;
  }
}
