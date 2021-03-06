import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetButton } from 'src/app/common/interface';
import { ImageMessage } from 'src/app/models/msg.model';
import { Message } from 'src/app/models/onchat.model';
import { FeedbackService } from 'src/app/services/feedback.service';
import { Overlay } from 'src/app/services/overlay.service';
import { EntityUtil } from 'src/app/utils/entity.util';
import { StrUtil } from 'src/app/utils/str.util';
import { SysUtil } from 'src/app/utils/sys.util';
import { SwiperComponent } from 'swiper/angular';
import SwiperCore, { Lazy, Zoom } from 'swiper/core';
import { LazyOptions, ZoomOptions } from 'swiper/types';
import { ModalComponent } from '../modal.component';

SwiperCore.use([Lazy, Zoom]);

@Component({
  selector: 'app-image-previewer',
  templateUrl: './image-previewer.component.html',
  styleUrls: ['./image-previewer.component.scss'],
})
export class ImagePreviewerComponent extends ModalComponent implements AfterViewInit {
  @Input() data: Message<ImageMessage>[] = [];
  @Input() index: number;

  trackByFn = EntityUtil.trackBy;

  zoom: ZoomOptions = {
    maxRatio: 5,
    minRatio: 0.75,
    toggle: true
  }

  lazy: LazyOptions = {
    preloaderClass: 'swiper-lazy-spinner'
  }

  @ViewChild(SwiperComponent) swiper: SwiperComponent;

  constructor(
    private feedbackService: FeedbackService,
    protected overlay: Overlay,
    protected router: Router
  ) {
    super();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.swiper.setIndex(this.index, 0, true);
      this.swiper.swiperRef.update();
    }, 500);
  }

  onPress(item: Message<ImageMessage>) {
    this.feedbackService.slightVibrate();
    this.presentActionSheet(item);
  }

  presentActionSheet(item: Message<ImageMessage>) {
    const buttons: ActionSheetButton[] = [{ text: '取消', role: 'cancel' }];

    if (StrUtil.isString(item.data.url)) {
      buttons.unshift({ text: '保存图片', handler: () => SysUtil.downLoadFile((item.data as ImageMessage).url) })
    }

    this.overlay.presentActionSheet(buttons);
  }

}
