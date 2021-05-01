import { Injectable } from '@angular/core';
import { from, fromEvent } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class Recorder {
  private recorder: MediaRecorder;

  constructor() { }

  /**
   * 申请权限并准备录音
   */
  record() {
    return from(navigator.mediaDevices.getUserMedia({ audio: true })).pipe(
      tap(stream => this.recorder = new MediaRecorder(stream))
    );
  }

  /**
   * 录音机状态
   */
  state() {
    return this.recorder?.state;
  }

  /**
   * 开始录音
   */
  start() {
    const event = fromEvent(this.recorder, 'start');
    this.recorder.start();
    return event;
  }

  /**
   * 结束录音
   */
  stop() {
    if (this.recorder) {
      this.recorder.state !== 'inactive' && this.recorder.stop();
      this.recorder.stream.getAudioTracks().forEach(o => o.stop());
      this.recorder = null;
    }
  }

  available() {
    return fromEvent<BlobEvent>(this.recorder, 'dataavailable');
  }
}
