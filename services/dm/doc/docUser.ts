import {GATE_APP} from '@/configs';
import {BaseApi, Fa} from '@fa/ui';
import {Dm} from '@/types';

/** ------------------------------------------ xx 操作接口 ------------------------------------------ */
class Api extends BaseApi<Dm.DocUser, number> {

  /** 获取实体 分页 */
  pageVo = (params: Fa.BasePageQuery<Dm.DocUserQueryVo>): Promise<Fa.Ret<Fa.Page<Dm.DocUserRetVo>>> => this.post('pageVo', params);

  /** 添加用户角色 */
  addUsers = (userIds: string[], docId: number): Promise<Fa.Ret<boolean>> => this.post('addUsers', { userIds, docId });

}

export default new Api(GATE_APP.dm.doc, 'docUser');
