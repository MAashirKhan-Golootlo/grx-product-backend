import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const uploadDir = join(process.cwd(), 'uploads');

const ensureUploadDir = (): void => {
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }
};

const imageFileFilter = (
  _req: Request,
  file: { originalname: string },
  callback: (error: Error | null, acceptFile: boolean) => void,
): void => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const extension = extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    callback(
      new Error('Only jpg, jpeg, png, and webp files are allowed'),
      false,
    );
    return;
  }

  callback(null, true);
};

@ApiTags('Uploads')
@Controller('uploads')
export class UploadController {
  @Post('image')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiOkResponse({
    schema: {
      example: {
        filename: '1746546212331-123456789.png',
        url: 'http://localhost:4000/uploads/1746546212331-123456789.png',
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (
          _req: Request,
          _file: Express.Multer.File,
          callback: (error: Error | null, destination: string) => void,
        ) => {
          ensureUploadDir();
          callback(null, uploadDir);
        },
        filename: (
          _req: Request,
          file: Express.Multer.File,
          callback: (error: Error | null, filename: string) => void,
        ) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          callback(
            null,
            `${uniqueSuffix}${extname(file.originalname).toLowerCase()}`,
          );
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: imageFileFilter,
    }),
  )
  public uploadImage(
    @UploadedFile() file: { filename: string } | undefined,
    @Req() req: Request,
  ): { filename: string; url: string } {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return {
      filename: file.filename,
      url: `${baseUrl}/uploads/${file.filename}`,
    };
  }
}
