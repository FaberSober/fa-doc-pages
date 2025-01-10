import {GATE_APP} from '@/configs';
import {BaseApi, type Fa} from '@fa/ui';
import type {Dm} from '@/types';

/** ------------------------------------------ xx 操作接口 ------------------------------------------ */
class Api extends BaseApi<Dm.DocUser, number> {

  /** 获取实体 分页 */
  pageVo = (params: Fa.BasePageQuery<Dm.DocUserQueryVo>): Promise<Fa.Ret<Fa.Page<Dm.DocUserRetVo>>> => this.post('pageVo', params);

  /** 添加用户角色 */
  addUsers = (userIds: string[], docId: number): Promise<Fa.Ret<boolean>> => this.post('addUsers', { userIds, docId });

  /** 批量添加用户 */
  batchAddUsers = (userIds: string[], docIds: number[]): Promise<Fa.Ret<boolean>> => this.post('batchAddUsers', { userIds, docIds });

  /** 批量删除用户 */
  batchRemoveUsers = (userIds: string[], docIds: number[]): Promise<Fa.Ret<boolean>> => this.post('batchRemoveUsers', { userIds, docIds });

}

export default new Api(GATE_APP.dm.doc, 'docUser');
