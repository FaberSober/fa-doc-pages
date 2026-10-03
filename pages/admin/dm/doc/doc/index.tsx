import React from 'react';
import { docApi } from '@/services';
import DocListMain from './cube/DocListMain';

/**
 * DOC-我的文档列表
 */
export default function DocList() {
  return <DocListMain queryApi={docApi.pageMine} />
}
