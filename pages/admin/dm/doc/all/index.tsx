import React from 'react';
import { docApi } from '@/services';
import DocListMain from '../doc/cube/DocListMain';

/**
 * DOC-全部文档列表
 */
export default function AllDocList() {
  return <DocListMain queryApi={docApi.page} />
}
