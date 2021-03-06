import { Inject, Injectable } from '@angular/core';
import { AudioName } from '../common/enum';
import { NAVIGATOR } from '../common/token';

/**
 * 反馈服务（音频，震动等）
 */
@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  /** 提示音：啵 */
  private booAudio: HTMLAudioElement = new Audio('/assets/audios/boo.mp3');
  /** 提示音：叮噔 */
  private dingDengAudio: HTMLAudioElement = new Audio('/assets/audios/ding-deng.mp3');

  constructor(
    @Inject(NAVIGATOR) private navigator: Navigator
  ) { }

  playAudio(audio: AudioName) {
    return {
      [AudioName.Boo]: this.booAudio,
      [AudioName.DingDeng]: this.dingDengAudio,
    }[audio].play();
  }

  /**
   * 轻微震动：50ms
   */
  slightVibrate() {
    this.navigator.vibrate?.(25);
  }

}
