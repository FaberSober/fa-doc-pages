import React, { useEffect, useState } from 'react';
import type { Fa } from '@fa/ui'
import { docChapterApi } from "@/services";
import type { Dm } from "@/types";
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
  docId?: number;
  shareCode?: string;
  docChapterId?: number;
  /** 父页面已加载的章节树，传入后复用该顺序 */
  chapterTree?: Fa.TreeNode<Dm.DocChapter>[];
  /** 章节树由父页面提供（可能仍在加载中），本组件不再单独请求章节树 */
  parentChapterTree?: boolean;
  onClickItem?: (v: Dm.DocChapter) => void;
}

/**
 * @author xu.pengfei
 * @date 2023/7/15 21:28
 */
export default function DocFooterNav({ docId, shareCode, docChapterId, chapterTree, parentChapterTree, onClickItem }: DocFooterNavProps) {

  // const [tree, setTree] = useState<Fa.TreeNode<Dm.DocChapter>[]>([])
  const [array, setArray] = useState<Dm.DocChapter[]>([])

  useEffect(() => {
    // 父页面提供章节树时直接复用，避免同一页面重复请求
    if (parentChapterTree) {
      setArray(flatTreeList(chapterTree))
      return
    }
    if (shareCode) {
      docChapterApi.outGetTree(shareCode).then(res => {
        setArray(flatTreeList(res.data))
      })
      return
    }
    if (docId === undefined) return
    docChapterApi.getTree({ query: { docId }}).then(res => {
      // setTree(tree)
      setArray(flatTreeList(res.data))
    })
  }, [docId, shareCode, chapterTree, parentChapterTree])

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
