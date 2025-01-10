import React, {useContext} from 'react';
import { BaseCascader, type BaseCascaderProps } from '@fa/ui';
import { docChapterApi as api } from '@/services';
import type { Dm } from '@/types';
import {DocLayoutContext} from "@features/fa-doc-pages/layout/doc/DocLayout";

export interface DocChapterCascadeProps extends Omit<BaseCascaderProps<Dm.DocChapter>, 'serviceApi'> {}

/**
 * @author xu.pengfei
 * @date 2020/12/25
 */
export default function DocChapterCascade(props: DocChapterCascadeProps) {
  const {doc} = useContext(DocLayoutContext)

  return (
    <BaseCascader
      showRoot={false}
      serviceApi={{
        ...api,
        allTree: () => api.getTree({query: {docId: doc.id}})
      }}
      {...props}
    />
  );
}
