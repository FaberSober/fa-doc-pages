import type { Fa } from '@fa/ui';
import type { Admin } from '@/types';

namespace Dm {

  /** DOC-文档 */
  export interface Doc extends Fa.BaseDelEntity {
    /** ID */
    id: number;
    /** 文档名称 */
    name: string;
    /** 是否公开 */
    isPublic: boolean;
    /** 分享码 */
    shareCode: string;
    /** 访问次数 */
    viewNum: number;
    /** 章节总访问次数 */
    viewChapterNum: number;
    // --------------- show cols ---------------
    userNameList: string[];
    userList: Admin.User[];
  }

  /** DOC-文档用户 */
  export interface DocUser extends Fa.BaseDelEntity {
    /** ID */
    id: number;
    /** 文档ID */
    docId: number;
    /** 用户ID */
    userId: string;
  }

  export interface DocUserRetVo extends DocUser {
    name: string;
    username: string;
  }

  export interface DocUserQueryVo {
    /** 文档ID */
    docId: number;
    /** 用户ID */
    userId: string;
    name: string;
    username: string;
  }

  /** DOC-文档章节 */
  export interface DocChapter extends Fa.BaseDelEntity {
    /** ID */
    id: number;
    /** 父ID */
    parentId: number;
    /** 文档ID */
    docId: number;
    /** 章节名称 */
    name: string;
    /** 排序 */
    sort: number;
    /** 访问次数 */
    viewNum: number;
  }

  /** DOC-文档章节详情 */
  export interface DocChapterDetail extends Fa.BaseUpdEntity {
    /** ID */
    id: number;
    /** 章节富文本内容 */
    content: string;
  }

  /** DOC-文档章节 */
  export interface DocChapterHis extends Fa.BaseDelEntity {
    /** ID */
    id: number;
    /** 文档ID */
    docId: number;
    /** 章节ID */
    chapterId: number;
    /** 版本名称 */
    name: string;
    /** 富文本内容 */
    content: string;
  }

  /** DOC-章节历史详情 */
  export interface DocChapterHisDetail extends Fa.BaseDelEntity {
    /** ID */
    id: number;
    /** 章节历史富文本内容 */
    content: string;
  }

}

export default Dm;
