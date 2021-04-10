import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { NoticeListComponent } from './notice-list/notice-list.component';
import { NoticePage } from './notice.page';
import { RequestListComponent } from './request-list/request-list.component';

const routes: Routes = [
  {
    path: '',
    component: NoticePage,
    children: [
      {
        path: 'notice-list',
        component: NoticeListComponent,
        data: { animation: 1 }
      },
      {
        path: 'request-list',
        component: RequestListComponent,
        data: { animation: 2 }
      },
      {
        path: '**',
        redirectTo: 'notice-list',
        pathMatch: 'full'
      }
    ],
    canActivate: [
      AuthGuard
    ],
    canLoad: [
      AuthGuard
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NoticePageRoutingModule { }
