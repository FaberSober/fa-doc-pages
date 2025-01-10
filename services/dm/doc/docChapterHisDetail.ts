import { GATE_APP } from '@/configs';
import { BaseApi } from '@fa/ui';
import type { Dm } from '@/types';

/** ------------------------------------------ xx 操作接口 ------------------------------------------ */
class Api extends BaseApi<Dm.DocChapterHisDetail, number> {}

export default new Api(GATE_APP.dm.doc, 'docChapterHisDetail');
