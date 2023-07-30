import React, {useContext, useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import {Dm} from "@features/fa-doc-pages/types";
import {docApi, docChapterApi, docChapterDetailApi} from "@features/fa-doc-pages/services";
import {Empty, FloatButton, Tag} from "antd";
import {Allotment} from "allotment";
import {ApiEffectLayoutContext, BaseTree, FaFlexRestLayout, FaUtils, PageLoading} from "@fa/ui";
import {DocLayout} from "@features/fa-doc-pages/layout";
import { FaRichHtmlImgPreview, FaToc } from '@/components'
import DocFooterNav from "@features/fa-doc-pages/components/helper/DocFooterNav";
import '@features/fa-doc-pages/components/style/docview.scss'


/**
 * 文档内网访问
 * out/dm/doc/view/:id
 * @author xu.pengfei
 * @date 2023/6/30 17:06
 */
export default function index() {
  const {id} = useParams()
  const {loadingEffect} = useContext(ApiEffectLayoutContext)

  const [doc, setDoc] = useState<Dm.Doc>()

  useEffect(() => {
    docApi.getMineById(Number(id)).then(res => {
      setDoc(res.data)

      docChapterApi.page({ pageSize: 1, query: { docId: res.data.id, parentId: 0 } }).then(res1 => {
        if (res1.data && res1.data.rows && res1.data.rows[0]) {
          handleClickDocChapter(res1.data.rows[0])
        }
      })
    })
  }, [])

  const [docChapter, setDocChapter] = useState<Dm.DocChapter>();
  const [docChapterDetail, setDocChapterDetail] = useState<Dm.DocChapterDetail>();

  function onTreeSelect(keys: any[], event: any) {
    if (keys.length === 0) return;
    handleClickDocChapter(event.node.sourceData);
  }

  function handleClickDocChapter(chapter: Dm.DocChapter) {
    setDocChapter(chapter);
    // 查询章节详情
    docChapterDetailApi.getById(chapter.id).then(res => {
      FaUtils.scrollToTop(document.getElementById('fa-doc-div')!)
      setDocChapterDetail(res.data)
      // 代码高亮
      setTimeout(() => {
        if (window.Prism) {
          window.Prism.highlightAll()
        }
      }, 100)
    })
  }

  const loading = loadingEffect[docApi.getUrl(`getById/${id}`)]
  if (loading) return <PageLoading />

  if (doc === undefined) return <Empty description="文档不存在"/>

  return (
    <DocLayout doc={doc}>
      <div className="fa-full-content fa-flex-column">
        <div className="fa-p12 fa-flex-row-center fa-border-b">
          <div className="h1 fa-mr12">{doc.name}</div>
          {doc.isPublic ? <Tag color="success">公开</Tag> : <Tag color="default">私有</Tag>}
        </div>

        <FaFlexRestLayout>
          <Allotment defaultSizes={[100, 500]}>
            {/* 左侧面板 */}
            <Allotment.Pane minSize={200} maxSize={400}>
              <div className="fa-full fa-flex-column">
                <div className="fa-p12 fa-border-b">目录</div>
                <FaFlexRestLayout>
                  <BaseTree
                    // showRoot
                    rootName="全部"
                    showOprBtn={false}
                    showTopBtn={false}
                    onSelect={onTreeSelect}
                    // 自定义配置
                    serviceName="章节"
                    serviceApi={{
                      ...docChapterApi,
                      allTree: () => docChapterApi.getTree({ query: { docId: id } })
                    }}
                    selectedKeys={docChapter ? [docChapter.id] : []}
                    draggable={false}
                  />
                </FaFlexRestLayout>

                <div className="fa-p12 fa-border-t fa-normal">
                  <div>创建用户：{doc.crtName}</div>
                  <div>创建时间：{doc.crtTime}</div>
                </div>
              </div>
            </Allotment.Pane>

            {/* 右侧编辑面板 */}
            <div className="fa-flex-row fa-full fa-relative">
              <div id='fa-doc-div' className="fa-full-content fa-scroll-auto-y fa-flex-column-center">
                <h1 style={{marginRight: 200}}>{docChapter?.name}</h1>

                <div style={{ minWidth: 700, maxWidth: 1100, marginRight: 200 }}>
                  <DocFooterNav
                    docId={doc.id}
                    docChapterId={docChapter?.id}
                    onClickItem={handleClickDocChapter}
                  />
                </div>

                {docChapterDetail && <div className="line-numbers" id={`fa-doc-main-${docChapterDetail.id}`} style={{ width: 800, marginRight: 200 }} dangerouslySetInnerHTML={{__html: docChapterDetail.content}} />}

                <div style={{ minWidth: 700, maxWidth: 1100, marginRight: 200 }}>
                  <DocFooterNav
                    docId={doc.id}
                    docChapterId={docChapter?.id}
                    onClickItem={handleClickDocChapter}
                  />
                </div>

                {/* img 图片预览 */}
                {docChapterDetail && <FaRichHtmlImgPreview domId={`fa-doc-main-${docChapterDetail.id}`} />}

                {docChapterDetail && <FloatButton.BackTop target={() => document.getElementById('fa-doc-div')!} />}
              </div>

              <div style={{position: 'fixed', top: 126, right: 10, width: 200, bottom: 12}}>
                {docChapterDetail && <FaToc parentDomId="fa-doc-div" domId={`fa-doc-main-${docChapterDetail.id}`} />}
              </div>
            </div>
          </Allotment>
        </FaFlexRestLayout>
      </div>
    </DocLayout>
  )
}