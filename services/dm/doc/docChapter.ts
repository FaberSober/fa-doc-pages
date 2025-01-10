import { GATE_APP } from '@/configs';
import { BaseTreeApi } from '@fa/ui';
import type { Dm } from '@/types';
import type {Fa} from "@fa/ui/src";

/** ------------------------------------------ xx 操作接口 ------------------------------------------ */
class Api extends BaseTreeApi<Dm.DocChapter, number> {

  /** 获取所有实体列表Tree */
  outGetTree = (params: Fa.BaseQueryParams = {}): Promise<Fa.Ret<Fa.TreeNode<Dm.DocChapter, number>[]>> => this.post(`outGetTree`, params);

  /** id查询 */
  outGetById = (id: number): Promise<Fa.Ret<Dm.DocChapter>> => this.get(`outGetById/${id}`);

  /** 分页获取 */
  outPage = (params: Fa.BasePageProps): Promise<Fa.Ret<Fa.Page<Dm.DocChapter>>> => this.post('outPage', params);

}

export default new Api(GATE_APP.dm.doc, 'docChapter');
