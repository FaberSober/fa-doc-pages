import React, { useEffect, useState } from 'react';
import { Fa } from '@fa/ui'
import { docChapterApi } from "@/services";
import { Dm } from "@/types";
import { findIndex } from "lodash";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";


/** 平铺Tree型结构 */
function flatTreeList(tree: Fa.TreeNode<Dm.DocChapter>[] = []): Dm.DocChapter[] {
  const list: Dm.DocChapter[] = [];
  tree.forEach((item) => {
    list.push(item.sourceData);
    const { children } = item;
    if (children && children[0]) {
      list.push(...flatTreeList(children));
    }
  });
  return list;
}

export interface DocFooterNavProps {
  docId: number;
  docChapterId?: number;
  onClickItem?: (v: Dm.DocChapter) => void;
}

/**
 * @author xu.pengfei
 * @date 2023/7/15 21:28
 */
export default function DocFooterNav({ docId, docChapterId, onClickItem }: DocFooterNavProps) {

  // const [tree, setTree] = useState<Fa.TreeNode<Dm.DocChapter>[]>([])
  const [array, setArray] = useState<Dm.DocChapter[]>([])

  useEffect(() => {
    docChapterApi.outGetTree({ query: { docId }}).then(res => {
      // setTree(tree)
      setArray(flatTreeList(res.data))
    })
  }, [docId])

  function handleClick(index: number) {
    const item = array[index];
    if (onClickItem) {
      onClickItem(item)
    }
  }

  const docChapterIndex = findIndex(array, i => i.id === docChapterId)
  const prevIndex = docChapterIndex - 1;
  const nextIndex = docChapterIndex + 1;

  return (
    <div className="fa-full-w fa-flex-row-center">
      {prevIndex >= 0 && prevIndex < array.length && (<div onClick={() => handleClick(prevIndex)} className="fa-link fa-flex-row-center fa-p12"><LeftOutlined />{array[prevIndex].name}</div>)}
      <div className="fa-flex-1" />
      {nextIndex >= 0 && nextIndex < array.length && (<div onClick={() => handleClick(nextIndex)} className="fa-link fa-flex-row-center fa-p12">{array[nextIndex].name}<RightOutlined /></div>)}
    </div>
  )
}