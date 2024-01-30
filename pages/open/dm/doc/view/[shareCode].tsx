import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { Dm } from "@/types";
import { docApi, docChapterApi, docChapterDetailApi } from "@/services";
import { Empty, FloatButton, Switch } from "antd";
import { Allotment } from "allotment";
import 'allotment/dist/style.css';
import { Helmet } from 'react-helmet-async';
import { ApiEffectLayoutContext, BaseTree, FaFlexRestLayout, FaUtils, PageLoading, ThemeLayoutContext, useQs } from "@fa/ui";
import { DocLayout } from "@features/fa-doc-pages/layout";
import { ConfigLayoutContext } from "@/layout";
import { isNil } from "lodash";
import { FaToc, FaRichHtmlImgPreview } from '@/components'
import { isMobile } from "react-device-detect";
import { DocFooterInfo, DocFooterNav } from "@features/fa-doc-pages/components";
import '@features/fa-doc-pages/components/style/docview.scss'


/**
 * 文档外网访问
 * out/dm/doc/view/:id
 * @author xu.pengfei
 * @date 2023/6/30 17:06
 */
export default function index() {
  const { themeDark, setThemeDark } = useContext(ThemeLayoutContext);

  const refTree = useRef<any>()
  const {shareCode} = useParams()
  const search = useQs();

  const navigate = useNavigate();
  const {loadingEffect} = useContext(ApiEffectLayoutContext)
  const {systemConfig} = useContext(ConfigLayoutContext)

  const [doc, setDoc] = useState<Dm.Doc>()

  useEffect(() => {
    if (isMobile) {
      let url = `/h5/dm/doc/view/${shareCode}`
      if (search && search.chapter && !Number.isNaN(search.chapter)) {
        url += `?chapter=${search.chapter}`
      }
      navigate(url)
      return;
    }

    docApi.outGetByShareCode(shareCode!).then(res => {
      setDoc(res.data)

      if (search && search.chapter && !Number.isNaN(search.chapter)) {
        docChapterApi.outGetById(Number(search.chapter)).then(res => {
          setDocChapter(res.data)
          getDocChapterDetail(res.data.id)
          // 初始打开，展开对应的Tree节点
          setTimeout(() => {
            if (refTree.current) {
              refTree.current.expandKeys(res.data.id)
            }
          }, 300)
        })
      } else {
        docChapterApi.outPage({ pageSize: 1, query: { docId: res.data.id, parentId: 0 }, sorter: 'sort ASC' }).then(res1 => {
          if (res1.data && res1.data.rows && res1.data.rows[0]) {
            setDocChapter(res1.data.rows[0])
            getDocChapterDetail(res1.data.rows[0].id)
          }
        })
      }
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
    getDocChapterDetail(chapter.id)
    navigate(window.location.pathname + "?chapter=" + chapter.id)
    // 展开Tree对应的节点
    if (refTree.current) {
      refTree.current.expandKeys(chapter.id)
    }
  }

  // 查询章节详情
  function getDocChapterDetail(chapterId: number) {
    docChapterDetailApi.outGetById(chapterId).then(res => {
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

  const loading = loadingEffect[docApi.getUrl(`outGetByShareCode/${shareCode}`)]
  if (loading) return <PageLoading />
  if (isNil(systemConfig)) return <PageLoading />

  if (doc === undefined) return <PageLoading />
  if (doc === null) return <Empty description="文档不存在"/>
  if (!doc.isPublic) return <Empty description="文档不存在"/>

  return (
    <DocLayout doc={doc}>
      <Helmet title={`${doc.name} | ${systemConfig.title}`} />

      <div className="fa-full-content fa-flex-column">
        <div className="fa-p12 fa-border-b fa-flex-row-center">
          <div className="h1">{doc.name}</div>
          <div className="fa-flex-1" />
          <Switch checkedChildren="暗色" unCheckedChildren="亮色" checked={themeDark} onChange={setThemeDark} />
        </div>

        <FaFlexRestLayout>
          <Allotment defaultSizes={[100, 500]}>
            {/* 左侧面板 */}
            <Allotment.Pane minSize={200} maxSize={400}>
              <div className="fa-full fa-flex-column">
                <div className="fa-p12 fa-border-b">目录</div>
                <FaFlexRestLayout>
                  <BaseTree
                    ref={refTree}
                    // showRoot
                    rootName="全部"
                    showOprBtn={false}
                    showTopBtn={false}
                    onSelect={onTreeSelect}
                    // 自定义配置
                    serviceName="章节"
                    serviceApi={{
                      ...docChapterApi,
                      allTree: () => docChapterApi.outGetTree({ query: { docId: doc.id } })
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
            <div className="fa-flex-row fa-full fa-relative fa-text">
              <div id='fa-doc-div' className="fa-full-content fa-scroll-auto-y fa-flex-column-center">
                <h1 id='fa-doc-title' style={{marginRight: 200}}>{docChapter?.name}</h1>

                <div style={{ width: 800, marginRight: 200 }}>
                  <DocFooterNav
                    docId={doc.id}
                    docChapterId={docChapter?.id}
                    onClickItem={handleClickDocChapter}
                  />
                </div>

                {docChapterDetail && <div className="line-numbers" id={`fa-doc-main-${docChapterDetail.id}`} style={{ width: 800, marginRight: 200 }} dangerouslySetInnerHTML={{__html: docChapterDetail.content}} />}

                <div style={{ width: 800, marginRight: 200 }}>
                  <DocFooterInfo docChapterDetail={docChapterDetail} />
                  <DocFooterNav
                    docId={doc.id}
                    docChapterId={docChapter?.id}
                    onClickItem={handleClickDocChapter}
                  />
                </div>

                {docChapterDetail && <FloatButton.BackTop target={() => document.getElementById('fa-doc-div')!} />}
              </div>

              <div style={{position: 'fixed', top: 60, right: 20, width: 200, bottom: 12}}>
                {docChapterDetail && <FaToc parentDomId="fa-doc-div" domId={`fa-doc-main-${docChapterDetail.id}`} />}
              </div>

              {/* img 图片预览 */}
              {docChapterDetail && <FaRichHtmlImgPreview domId={`fa-doc-main-${docChapterDetail.id}`} />}
            </div>
          </Allotment>
        </FaFlexRestLayout>
      </div>
    </DocLayout>
  )
}