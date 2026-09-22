import { GATE_APP } from '@/configs';
import { BaseTreeApi, type Fa } from '@fa/ui';
import type { Dm } from '@/types';

/** ------------------------------------------ xx 操作接口 ------------------------------------------ */
class Api extends BaseTreeApi<Dm.DocChapter, number> {

  /** 获取所有实体列表Tree */
  outGetTree = (shareCode: string, params: Fa.BaseQueryParams = {}): Promise<Fa.Ret<Fa.TreeNode<Dm.DocChapter, number>[]>> => this.post(`outGetTree/${shareCode}`, params);

  /** id查询 */
  outGetById = (shareCode: string, id: number): Promise<Fa.Ret<Dm.DocChapter>> => this.get(`outGetById/${shareCode}/${id}`);

  /** 分页获取 */
  outPage = (shareCode: string, params: Fa.BasePageProps): Promise<Fa.Ret<Fa.Page<Dm.DocChapter>>> => this.post(`outPage/${shareCode}`, params);

}

export default new Api(GATE_APP.dm.doc, 'docChapter');
