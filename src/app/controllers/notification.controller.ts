import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, Inject, Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { NotificationOptions } from '../common/interface';
import { WINDOW } from '../common/token';
import { NotificationComponent } from '../components/notification/notification.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationController {
  private overlayConfig = new OverlayConfig();
  private overlayRef: OverlayRef;
  private componentRef: ComponentRef<NotificationComponent>;

  option: NotificationOptions;
  /** 通知关闭计时器 */
  private dismissTimeout: number;
  /** 一个订阅器 */
  private subscription: Subscription;

  constructor(
    private overlay: Overlay,
    @Inject(WINDOW) private window: Window,
  ) {
    // 全局显示，水平居中，位于顶部
    this.overlayConfig.positionStrategy = this.overlay.position().global().centerHorizontally().top();
  }

  /**
   * 创建一个通知
   * @param opts
   */
  create(opts: NotificationOptions): NotificationController {
    this.option = opts;

    this.overlayRef ??= this.overlay.create(this.overlayConfig);

    return this;
  }

  /**
   * 弹出通知
   * 如果通知已经存在，则更新内容并重新计时
   */
  present(): NotificationController {
    this.dismissTimeout && this.clearDismissTimeout();
    this.subscription && !this.subscription.closed && this.subscription.unsubscribe();

    this.componentRef ??= this.overlayRef.attach(new ComponentPortal(NotificationComponent));
    this.componentRef.instance.overlayRef = this.overlayRef;

    const { title, description, icon, duration, url, handler } = this.option;

    this.componentRef.instance.title = title;
    this.componentRef.instance.description = description;
    this.componentRef.instance.icon = icon;
    this.componentRef.instance.url = url;
    this.componentRef.instance.handler = handler;

    // 监听通知关闭事件
    this.subscription = this.componentRef.instance.onDismiss().pipe(take(1)).subscribe(() => {
      this.clearRef();
      this.clearDismissTimeout();
    });

    // 开始计时
    this.dismissTimeout = this.window.setTimeout(() => this.dismiss(), duration || 5000);

    return this;
  }

  /**
   * 关闭通知
   */
  dismiss(): Observable<void> {
    this.componentRef.instance.dismiss().pipe(take(1)).subscribe(() => {
      this.clearRef();
      this.clearDismissTimeout();
    });

    return this.componentRef.instance.dismiss();
  }

  private clearDismissTimeout(): void {
    this.window.clearTimeout(this.dismissTimeout);
    this.dismissTimeout = null;
  }

  private clearRef(): void {
    this.componentRef = null;
    this.overlayRef = null;
  }
}
