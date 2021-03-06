import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { FriendRequestBySelfIdResolve } from 'src/app/resolvers/friend-request.resolver';
import { UserResolve } from 'src/app/resolvers/user.resolver';
import { HandlePage } from './handle.page';

const routes: Routes = [
  {
    path: ':userId',
    component: HandlePage,
    resolve: {
      user: UserResolve,
      request: FriendRequestBySelfIdResolve
    },
    canActivate: [
      AuthGuard
    ],
    canLoad: [
      AuthGuard,
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HandlePageRoutingModule { }
