import type { CustomDecorator } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';

export const SKIP_RESPONSE_TRANSFORM_KEY = 'skipResponseTransform';

export const SkipResponseTransform = (): CustomDecorator<string> =>
  SetMetadata(SKIP_RESPONSE_TRANSFORM_KEY, true);
