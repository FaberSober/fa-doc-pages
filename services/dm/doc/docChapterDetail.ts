import { GATE_APP } from '@/configs';
import { BaseApi } from '@fa/ui';
import { Dm } from '@/types';
import {Fa} from "@fa/ui/src";

/** ------------------------------------------ xx 操作接口 ------------------------------------------ */
class Api extends BaseApi<Dm.DocChapterDetail, number> {

  /** 查询或新增 */
  getOrCreateById = (id: number): Promise<Fa.Ret<Dm.DocChapterDetail>> => this.post(`getOrCreateById`, { id });

  /** id查询 */
  outGetById = (id: number): Promise<Fa.Ret<Dm.DocChapterDetail>> => this.get(`outGetById/${id}`);

}

export default new Api(GATE_APP.dm.doc, 'docChapterDetail');
