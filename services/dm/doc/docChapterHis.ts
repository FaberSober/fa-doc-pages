import { GATE_APP } from '@/configs';
import { BaseApi } from '@fa/ui';
import { Dm } from '@/types';

/** ------------------------------------------ xx 操作接口 ------------------------------------------ */
class Api extends BaseApi<Dm.DocChapterHis, number> {}

export default new Api(GATE_APP.dm.doc, 'docChapterHis');
