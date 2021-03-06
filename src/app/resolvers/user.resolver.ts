import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Result, User } from '../models/onchat.model';
import { UserService } from '../services/apis/user.service';
import { GlobalData } from '../services/global-data.service';

/**
 * 用户Resolve，根据路由参数中的userId来获得user
 */
@Injectable({
  providedIn: 'root',
})
export class UserResolve implements Resolve<User> {
  constructor(
    private userService: UserService,
    private globalData: GlobalData
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User> | User {
    const userId = +route.params.userId;
    const { user } = this.globalData;

    return (user?.id === userId) ? user : this.userService.getUser(userId).pipe(
      map(({ data }: Result<User>) => data)
    );
  }
}