import React, { useContext, useEffect, useRef, useState } from 'react';
import { useParams } from "react-router-dom";
import { Drawer, Empty, Spin } from "antd";
import { Allotment } from "allotment";
import 'allotment/dist/style.css';
import { ApiEffectLayoutContext, BaseTinyMCE, BaseTree, FaFlexRestLayout, PageLoading, ThemeLayoutContext } from "@fa/ui";
import { Dm } from "@/types";
import { docApi, docChapterApi, docChapterDetailApi } from "@/services";
import { DocLayout } from "@features/fa-doc-pages/layout";
import { isNil } from "lodash";
import DocChapterModal from "./modal/DocChapterModal";
import DocChapterHisList from "./cube/DocChapterHisList";


let hasChange = false; // 是否有内容更新，关闭浏览器之前做提醒判断
let staticDocChapterDetail: Dm.DocChapterDetail|undefined;

/**
 * 文档编辑
 * @author xu.pengfei
 * @date 2023/6/30 17:06
 */
export default function index() {
  const {id} = useParams()
  const {themeDark} = useContext(ThemeLayoutContext)
  const {loadingEffect} = useContext(ApiEffectLayoutContext)
  const ref = useRef<any>()

  const [doc, setDoc] = useState<Dm.Doc>()
  const [hisOpen, setHisOpen] = useState(false) // 历史版本Drawer open state
  const [docChapter, setDocChapter] = useState<Dm.DocChapter>();
  const [docChapterDetail, setDocChapterDetail] = useState<Dm.DocChapterDetail>();

  useEffect(() => {
    docApi.getMineById(Number(id)).then(res => {
      setDoc(res.data)
      setDocChapter(undefined)
      setDocChapterDetail(undefined)
    })
  }, [id])

  useEffect(() => {
    window.onbeforeunload = () => {
      // console.log('hasChange', hasChange)
      // For Safari
      return hasChange ? 'Sure?' : undefined;
    };
  }, [])

  function onTreeSelect(keys: any[], event: any) {
    if (keys.length === 0) return;

    // 保存现有的章节内容
    handleSave();
    setHtml('')

    const data: Dm.DocChapter = event.node.sourceData
    setDocChapter(data);
    // 查询章节详情
    docChapterDetailApi.getOrCreateById(data.id).then(res => {
      setDocChapterDetail({ ...res.data })
      staticDocChapterDetail = { ...res.data }
      setHtml(res.data.content)
    })
  }

  function onAfterDelItem() {
    setDocChapter(undefined);
    setDocChapterDetail(undefined)
    staticDocChapterDetail = undefined
  }

  function setHtml(html: string) {
    ref.current?.setContent(html)
  }

  function handleContentChange(v: any) {
    // console.log('handleContentChange', v, docChapterDetail, 'staticDocChapterDetail', staticDocChapterDetail)
    hasChange = true
    if (docChapterDetail) {
      docChapterDetail.content = v
    }
  }

  function handleSave() {
    if (staticDocChapterDetail === undefined) return;
    if (isNil(ref.current)) return;

    const content = ref.current.getContent();
    if (content === staticDocChapterDetail.content) {
      // console.log('content no change')
      return;
    }
    docChapterDetailApi.update(staticDocChapterDetail.id, {content}).then(_res => {
      hasChange = false
    })
  }

  function handleRestore(his:Dm.DocChapterHisDetail) {
    ref.current?.setContent(his.content)
    setHisOpen(false)
    handleSave()
  }

  const loading = loadingEffect[docApi.getUrl(`getById/${id}`)]
  if (loading) return <PageLoading />
  if (doc === undefined) return <Empty description="文档不存在"/>

  const fetching = loadingEffect[docChapterDetailApi.getUrl('getOrCreateById')]

  const htmlBgColor = themeDark ? '#222f3e' : '#F1F1F1';
  const bodyBgColor = themeDark ? '#08202f' : '#FFFFFF';

  let content_style = `html {background:${htmlBgColor};} `;
  content_style += ` body { font-family:"Microsoft YaHei", "Helvetica Neue", "PingFang SC"; font-size:14px; line-height: 1.2; width: 800px; margin: 12px auto; background: ${bodyBgColor}; padding: 12px; border-radius: 4px; } `
  content_style += ' img {max-width: 800px; height: auto;} '
  content_style += ' video {max-width: 800px; height: auto;} '

  return (
    <DocLayout doc={doc}>
      <div className="fa-full-content">
        <Allotment defaultSizes={[100, 500]}>
          {/* 左侧面板 */}
          <Allotment.Pane minSize={200} maxSize={400}>
            <BaseTree
              // showRoot
              rootName="全部"
              showOprBtn
              onSelect={onTreeSelect}
              onAfterDelItem={onAfterDelItem}
              // 自定义配置
              serviceName="章节"
              ServiceModal={DocChapterModal}
              serviceApi={{
                ...docChapterApi,
                allTree: () => docChapterApi.getTree({query: {docId: id}})
              }}
              selectedKeys={docChapter ? [docChapter.id] : []}
              showTips
              extraEffectArgs={[id]}
            />
          </Allotment.Pane>

          {/* 右侧编辑面板 */}
          <div className="fa-flex-column fa-full fa-p12 fa-flex-column">
            {docChapterDetail && (
              <>
                <FaFlexRestLayout>
                  {docChapterDetail && !fetching && (
                    <BaseTinyMCE
                      ref={ref}
                      style={{width: '100%', height: '100%'}}
                      value={docChapterDetail.content} // 第一次加载组件成功后的初始化值
                      onChange={handleContentChange}
                      onSave={handleSave}
                      editorInit={{
                        toolbar: 'save blocks fontsize fontfamily bold italic underline blockquote lineheight alignleft aligncenter alignright alignjustify anchor forecolor bullist numlist table link image media charmap emoticons codesample code fullscreen insertdatetime faHis help',
                        content_style,
                        setup: (editor: any) => {
                          // console.log('setup', editor)
                          /* 历史版本 */
                          editor.ui.registry.addButton('faHis', {
                            text: '历史版本',
                            tooltip: '插入当前时间',
                            onAction: function () {
                              setHisOpen(true)
                            }
                          });
                        },
                        // video_template_callback: (data:any) =>
                        //   `<video width="${data.width}" height="${data.height}"${data.poster ? ` poster="${data.poster}"` : ''} controls="controls">\n` +
                        //   `<source src="${data.source}"${data.sourcemime ? ` type="${data.sourcemime}"` : ''} />\n` +
                        //   (data.altsource ? `<source src="${data.altsource}"${data.altsourcemime ? ` type="${data.altsourcemime}"` : ''} />\n` : '') +
                        //   '</video>'
                      }}
                    />
                  )}
                </FaFlexRestLayout>
              </>
            )}

            {isNil(docChapterDetail) && <Empty description="请选择右侧章节进行编辑"/>}
          </div>
        </Allotment>

        {fetching && <div className="fa-full-content fa-flex-center" style={{ zIndex: 9999, cursor: 'wait', background: 'EEEEEE4C' }}><Spin size="large"/></div>}

        {/* Doc His */}
        <Drawer open={hisOpen} onClose={() => setHisOpen(false)} width={900} title="查看历史版本">
          {docChapter && hisOpen && <DocChapterHisList chapterId={docChapter.id} onRestoreTo={handleRestore} />}
        </Drawer>
      </div>
    </DocLayout>
  )
}