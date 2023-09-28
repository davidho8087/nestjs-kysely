import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { ArticlesRepository } from './articles.repository';

@Module({
  controllers: [ArticlesController],
  providers: [ArticlesRepository, ArticlesService],
})
export class ArticlesModule {}
