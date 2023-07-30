import React, {useContext, useEffect, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import {Dm} from "@features/fa-doc-pages/types";
import {docApi, docChapterApi, docChapterDetailApi} from "@features/fa-doc-pages/services";
import { Button, Drawer, Empty, FloatButton, Switch } from "antd";
import {Helmet} from 'react-helmet-async';
import { ApiEffectLayoutContext, BaseTree, FaUtils, PageLoading, ThemeLayoutContext, useQs } from "@fa/ui";
import {DocLayout} from "@features/fa-doc-pages/layout";
import {ConfigLayoutContext} from "@features/fa-admin-pages/layout";
import {isNil} from "lodash";
import { FaRichHtmlImgPreview, FaToc } from '@/components'
import {AlignRightOutlined, OrderedListOutlined} from "@ant-design/icons";
import {isMobile} from "react-device-detect";
import '@features/fa-doc-pages/components/style/docview.scss'
import {DocFooterInfo, DocFooterNav} from "@features/fa-doc-pages/components";



/**
 * H5-文档外网访问
 * out/dm/doc/view/:id
 * @author xu.pengfei
 * @date 2023/6/30 17:06
 */
export default function index() {
  const { themeDark, setThemeDark } = useContext(ThemeLayoutContext);

  const {shareCode} = useParams()
  const search = useQs();

  const navigate = useNavigate();
  const {loadingEffect} = useContext(ApiEffectLayoutContext)
  const {systemConfig} = useContext(ConfigLayoutContext)

  const [doc, setDoc] = useState<Dm.Doc>()
  const [chapterOpen, setChapterOpen] = useState(false)
  const [tocOpen, setTocOpen] = useState(false)

  useEffect(() => {
    if (!isMobile) {
      let url = `/open/dm/doc/view/${shareCode}`
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

    setChapterOpen(false)
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
  if (loading) return <PageLoading/>
  if (isNil(systemConfig)) return <PageLoading/>

  if (doc === undefined) return <PageLoading />
  if (doc === null) return <Empty description="文档不存在"/>
  if (!doc.isPublic) return <Empty description="文档不存在"/>

  return (
    <DocLayout doc={doc}>
      <Helmet title={`${doc.name} | ${systemConfig.title}`}/>
      <div className="fa-full-content fa-flex-column">
        <div className="fa-flex-row-center fa-relative fa-border-b fa-p4">
          <Button onClick={() => setChapterOpen(true)} icon={<OrderedListOutlined />} />
          <div className="fa-flex-1 fa-h3 fa-text-center">{doc.name}</div>
          <Button onClick={() => setTocOpen(true)} icon={<AlignRightOutlined />} />
        </div>

        {/* 右侧编辑面板 */}
        <div className="fa-flex-row fa-full fa-relative fa-text">
          <div id='fa-doc-div' className="fa-full-content fa-scroll-auto-y fa-flex-column-center">
            <div id='fa-doc-title' className="fa-h3">{docChapter?.name}</div>

            <DocFooterNav
              docId={doc.id}
              docChapterId={docChapter?.id}
              onClickItem={handleClickDocChapter}
            />

            {docChapterDetail && (
              <div style={{width: '90%'}}>
                <div className="line-numbers" id={`fa-doc-main-${docChapterDetail.id}`} dangerouslySetInnerHTML={{__html: docChapterDetail.content}} />
              </div>
            )}

            <DocFooterInfo docChapterDetail={docChapterDetail} />
            <DocFooterNav
              docId={doc.id}
              docChapterId={docChapter?.id}
              onClickItem={handleClickDocChapter}
            />

            {/* img 图片预览 */}
            {docChapterDetail && <FaRichHtmlImgPreview domId={`fa-doc-main-${docChapterDetail.id}`} />}

            {docChapterDetail && <FloatButton.BackTop target={() => document.getElementById('fa-doc-div')!}/>}
          </div>
        </div>
      </div>

      {/* Chapter Tree */}
      <Drawer
        open={chapterOpen}
        onClose={() => setChapterOpen(false)}
        bodyStyle={{position: 'relative'}}
        placement="left"
        title="章节"
        extra={(
          <Switch checkedChildren="暗色" unCheckedChildren="亮色" checked={themeDark} onChange={setThemeDark} />
        )}
      >
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
            allTree: () => docChapterApi.outGetTree({query: {docId: doc.id}})
          }}
          selectedKeys={docChapter ? [docChapter.id] : []}
          draggable={false}
        />
      </Drawer>

      {/* toc */}
      <Drawer
        open={tocOpen}
        onClose={() => setTocOpen(false)}
        bodyStyle={{position: 'relative'}}
        title="目录"
      >
        <div>
          {docChapterDetail && <FaToc parentDomId="fa-doc-div" domId={`fa-doc-main-${docChapterDetail.id}`} onClickToc={() => setTocOpen(false)} />}
        </div>
      </Drawer>
    </DocLayout>
  )
}