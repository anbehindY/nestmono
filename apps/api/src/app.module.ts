import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './shared/database/prisma.module';
import { LoggerModule } from './shared/logger/logger.module';
import { HealthController } from './shared/http/health.controller';
import { validateEnv } from './shared/config/env.validation';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PostsModule } from './modules/posts/posts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    LoggerModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    PostsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
