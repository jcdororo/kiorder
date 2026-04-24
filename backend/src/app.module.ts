import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { StoreModule } from './store/store.module';
import { MenuModule } from './menu/menu.module';
import { OrderModule } from './order/order.module';
import { TableModule } from './table/table.module';
import { WaitingEntryModule } from './waiting-entry/waiting-entry.module';

@Module({
  imports: [
    AuthModule,
    StoreModule,
    MenuModule,
    OrderModule,
    TableModule,
    WaitingEntryModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
