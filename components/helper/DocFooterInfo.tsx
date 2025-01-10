import React from 'react';
import type {Dm} from "@/types";
import {isNil} from "lodash";


export interface DocFooterNavProps {
  docChapterDetail?: Dm.DocChapterDetail;
}

/**
 * 文档底部的信息：
 * 1. 更新用户、更新时间
 * @author xu.pengfei
 * @date 2023/7/15 21:28
 */
export default function DocFooterInfo({ docChapterDetail }: DocFooterNavProps) {

  if (isNil(docChapterDetail)) return null;

  return (
    <div className="fa-full-w fa-flex-row-center">
      <div className="fa-flex-1" />
      <div className="fa-flex-row-center">
        {docChapterDetail.updName}_更新于_{docChapterDetail.updTime}
      </div>
    </div>
  )
}