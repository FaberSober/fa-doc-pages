import React, {useEffect} from 'react';
import {EyeOutlined, ReloadOutlined} from '@ant-design/icons';
import {Button, Drawer, Form, Input, Space} from 'antd';
import {AuthDelBtn, BaseBizTable, BaseTableUtils, FaberTable, FaFlexRestLayout, FaHref, FaUtils, useDelete, useTableQueryParams, useViewItem} from '@fa/ui';
import {docChapterHisApi, docChapterHisApi as api, docChapterHisDetailApi} from '@/services';
import {Dm} from '@/types';
import {FaToc} from "@features/fa-admin-pages/components";

const serviceName = '历史版本';
const biz = 'dm_doc_chapter_his';


export interface DocChapterHisListProps {
  chapterId: number;
  onRestoreTo?: (his: Dm.DocChapterHisDetail) => void;
}

/**
 * DOC-文档章节表格查询
 */
export default function DocChapterHisList({chapterId, onRestoreTo}: DocChapterHisListProps) {
  const [form] = Form.useForm();

  const { queryParams, setFormValues, handleTableChange, setSceneId, setConditionList, setExtraParams, fetchPageList, loading, list, paginationProps } =
    useTableQueryParams<Dm.DocChapterHis>(api.page, {extraParams: {chapterId}}, serviceName)

  useEffect(() => {
    setExtraParams({ chapterId })
  }, [chapterId])

  const [handleDelete] = useDelete<number>(api.remove, fetchPageList, serviceName)

  const {open, item, show, hide} = useViewItem<Dm.DocChapterHisDetail>()

  function handleRestore() {
    if (item === undefined) return;

    hide();
    if (onRestoreTo) {
      onRestoreTo(item)
    }
  }

  function showHis(r: Dm.DocChapterHis) {
    docChapterHisDetailApi.getById(r.id).then(res => {
      show(res.data)
      // 代码高亮
      setTimeout(() => {
        if (window.Prism) {
          window.Prism.highlightAll()
        }
      }, 100)
    })
  }

  /** 生成表格字段List */
  function genColumns() {
    const { sorter } = queryParams;
    return [
      BaseTableUtils.genSimpleSorterColumn('创建时间', 'crtTime', 170, sorter),
      BaseTableUtils.genSimpleSorterColumn('创建用户', 'crtName', 100, sorter),
      {
        ...BaseTableUtils.genSimpleSorterColumn('版本名称', 'name', undefined, sorter),
        render: (v, r) => (
          <Input
            defaultValue={v}
            onBlur={(e) => {
              docChapterHisApi.update(r.id, { name: e.target.value }).then(res => FaUtils.showResponse(res, '版本命名'))
            }}
            className="fa-input-underline"
          />
        )
      },
      {
        title: '操作',
        dataIndex: 'menu',
        render: (_, r) => (
          <Space>
            <FaHref icon={<EyeOutlined />} text="查看" onClick={() => showHis(r)} />
            <AuthDelBtn handleDelete={() => handleDelete(r.id)} />
          </Space>
        ),
        width: 120,
        fixed: 'right',
        tcRequired: true,
        tcType: 'menu',
      },
    ] as FaberTable.ColumnsProp<Dm.DocChapterHis>[];
  }

  return (
    <div className="fa-full-content fa-flex-column fa-bg-white">
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative', padding: 8 }}>
        <Form form={form} layout="inline" onFinish={setFormValues}>
          <Space>
            <Button htmlType="submit" loading={loading} icon={<ReloadOutlined />}>刷新</Button>
          </Space>
        </Form>
      </div>

      <BaseBizTable
        rowKey="id"
        biz={biz}
        columns={genColumns()}
        pagination={paginationProps}
        loading={loading}
        dataSource={list}
        onChange={handleTableChange}
        refreshList={() => fetchPageList()}
        batchDelete={(ids) => api.removeBatchByIds(ids)}
        onSceneChange={(v) => setSceneId(v)}
        onConditionChange={(cL) => setConditionList(cL)}
      />

      <Drawer title="查看历史版本" open={open} onClose={hide} bodyStyle={{position: 'relative'}} width={1035}>
        <div className="fa-full-content fa-p12 fa-flex-column">
          <Space className="fa-mb12">
            <Button onClick={handleRestore}>恢复到此版本</Button>
          </Space>

          <FaFlexRestLayout>
            {item && (
              <div id="fa-doc-div" className="fa-full-content fa-scroll-auto-y fa-flex-column-center fa-text">
                <div id={`fa-doc-main-${item.id}`} dangerouslySetInnerHTML={{__html: item.content}} style={{ width: 800, marginRight: 200 }} />

                <div style={{position: 'fixed', top: 103, right: 20, width: 200, bottom: 12}}>
                  <FaToc parentDomId="fa-doc-div" domId={`fa-doc-main-${item.id}`} />
                </div>
              </div>
            )}
          </FaFlexRestLayout>
        </div>
      </Drawer>
    </div>
  );
}
