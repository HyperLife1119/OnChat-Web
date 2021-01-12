import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { IonItemSliding } from '@ionic/angular';
import { CHAT_ITEM_ROWS } from 'src/app/common/constant';
import { ChatroomType, ChatSessionType, MessageType, ResultCode } from 'src/app/common/enum';
import { ChatSession, Result } from 'src/app/models/onchat.model';
import { GlobalDataService } from 'src/app/services/global-data.service';
import { OnChatService } from 'src/app/services/onchat.service';
import { DateUtil } from 'src/app/utils/date.util';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss']
})
export class ChatPage implements OnInit {
  msgType = MessageType;
  chatSessionType = ChatSessionType;

  @ViewChildren(IonItemSliding) ionItemSlidings: QueryList<IonItemSliding>;

  constructor(
    private router: Router,
    private onChatService: OnChatService,
    public globalDataService: GlobalDataService,
  ) { }

  ngOnInit() { }

  /**
   * 用于提升性能
   * 一般情况下，当数组内有变更时，
   * Angular将会对整个DOM树加以重新渲染。
   * 如果加上trackBy方法，Angular将会知道具体的变更元素，
   * 并针对性地对此特定元素进行DOM刷新，提升页面渲染性能。
   */
  trackByFn(index: number, item: ChatSession): number {
    return item.id;
  }

  /**
   * 刷新
   * @param event
   */
  refresh(event: any) {
    this.globalDataService.chatListPage = 1;
    this.onChatService.setChatSession().subscribe(() => {
      event.target.complete();
    });
  }

  chatList() {
    const { chatListPage, chatList } = this.globalDataService;
    return chatListPage ? chatList.slice(0, chatListPage * CHAT_ITEM_ROWS) : chatList;
  }

  /**
   * 加载更多
   * @param event
   */
  loadData(event: any) {
    if (!this.globalDataService.chatListPage) {
      return event.target.complete();
    }

    if (++this.globalDataService.chatListPage * CHAT_ITEM_ROWS >= this.globalDataService.chatList.length) {
      this.globalDataService.chatListPage = null;
    }

    event.target.complete();
  }

  canShowTime(date: number) {
    return DateUtil.isSameWeek(new Date(date));
  }

  /**
   * 移除聊天列表子项
   * @param index
   */
  removeChatSession(index: number) {
    // 使用setTimeout解决手指点击后 还未来得及松开 后面的列表项跑上来 触发点击的问题
    setTimeout(() => {
      this.globalDataService.chatList.splice(index, 1);
    }, 50);
  }

  /**
   * 置顶聊天列表子项
   * @param item
   * @param i
   */
  doSticky(item: ChatSession, i: number) {
    if (item.sticky) {
      return this.onChatService.unstickyChatSession(item.id).subscribe((result: Result) => {
        if (result.code === ResultCode.Success) {
          item.sticky = false;
          this.globalDataService.chatList = this.globalDataService.chatList;

          this.closeIonItemSliding(i);
        }
      });
    }

    this.onChatService.stickyChatSession(item.id).subscribe((result: Result) => {
      if (result.code === ResultCode.Success) {
        item.sticky = true;
        this.globalDataService.chatList = this.globalDataService.chatList;

        this.closeIonItemSliding(i);
      }
    });
  }

  /**
   * 将聊天列表子项设置为已读
   * @param item
   * @param i
   */
  doRead(item: ChatSession, i: number) {
    if (item.unread == 0) {
      return this.onChatService.unreadChatSession(item.id).subscribe((result: Result) => {
        if (result.code === ResultCode.Success) {
          item.unread = 1;
          this.closeIonItemSliding(i);
        }
      });
    }

    if (item.type === ChatSessionType.ChatroomNotice) {
      return this.onChatService.readedChatRequests().subscribe((result: Result) => {
        if (result.code === ResultCode.Success) {
          item.unread = 0;
          this.closeIonItemSliding(i);
        }
      });
    }

    this.onChatService.readedChatSession(item.id).subscribe((result: Result) => {
      if (result.code === ResultCode.Success) {
        item.unread = 0;
        this.closeIonItemSliding(i);
      }
    });
  }

  /**
   * 合上IonItemSliding
   * @param i
   */
  closeIonItemSliding(i: number) {
    this.ionItemSlidings.forEach((item: IonItemSliding, index: number) => {
      index == i && item.close();
    });
  }

  onTap(chatSession: ChatSession) {
    switch (chatSession.type) {
      case ChatSessionType.Chatroom:
        this.router.navigate(['chat', chatSession.data.chatroomId]);
        break;

      case ChatSessionType.ChatroomNotice:
        this.router.navigateByUrl('/chatroom/notice');
        break;
    }
  }

  // TODO 改成管道，但我还没想好名字
  /**
   * 解析会话项的消息的发送者名称
   * @param chatSession
   */
  target(chatSession: ChatSession) {
    if (chatSession.content.userId == this.globalDataService.user.id) {
      return '我: ';
    } else if (chatSession.data.chatroomType == ChatroomType.Private) {
      return 'Ta: '
    } else {
      return (chatSession.content.nickname || chatSession.content.userId) + ': ';
    }
  }

}
