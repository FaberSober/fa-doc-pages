import { GATE_APP } from '@/configs';
import { BaseApi } from '@fa/ui';
import type { Dm } from '@/types';
import type {Fa} from "@fa/ui/src";

/** ------------------------------------------ xx 操作接口 ------------------------------------------ */
class Api extends BaseApi<Dm.Doc, number> {

  /** 分页获取 */
  pageMine = (params: Fa.BasePageProps): Promise<Fa.Ret<Fa.Page<Dm.Doc>>> => this.post('pageMine', params);

  /** id查询 */
  getMineById = (id: number): Promise<Fa.Ret<Dm.Doc>> => this.get(`getMineById/${id}`);

  /** id查询 */
  outGetById = (id: number): Promise<Fa.Ret<Dm.Doc>> => this.get(`outGetById/${id}`);

  /** 分享码查询 */
  outGetByShareCode = (shareCode: string): Promise<Fa.Ret<Dm.Doc>> => this.get(`outGetByShareCode/${shareCode}`);

}

export default new Api(GATE_APP.dm.doc, 'doc');
