import React, {useContext} from 'react';
import { BookOutlined, DeleteOutlined, DownloadOutlined, EyeOutlined, PlusOutlined, SearchOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { Avatar, Button, Form, Input, Space, Tooltip } from 'antd';
import { AuthDelBtn, BaseBizTable, BaseBoolSelector, BaseDrawer, BaseTableUtils, BizUserSelect, clearForm, FaberTable, FaHref, FaUtils, SelectedUser, useDelete, useExport, useTableQueryParams } from '@fa/ui';
import { docApi as api, docUserApi, fileSaveApi } from '@/services';
import {Dm} from '@/types';
import {MenuLayoutContext} from '@/layout';
import DocModal from './modal/DocModal';
import DocUserList from "./cube/DocUserList";

const serviceName = '文档';
const biz = 'dm_doc';

/**
 * DOC-文档表格查询
 */
export default function DocList() {
  const {addTab} = useContext(MenuLayoutContext)
  const [form] = Form.useForm();

  const {queryParams, setFormValues, handleTableChange, setSceneId, setConditionList, fetchPageList, loading, list, paginationProps} =
    useTableQueryParams<Dm.Doc>(api.pageMine, {}, serviceName)

  const [handleDelete] = useDelete<number>(api.remove, fetchPageList, serviceName)
  const [exporting, fetchExportExcel] = useExport(api.exportExcel, queryParams)

  function handleOpenBookView(r: Dm.Doc) {
    const url = `/admin/dm/doc/view/${r.id}`
    addTab({
      key: url,
      path: url,
      name: `查看-${r.name}`,
      type: 'inner', // iframe, inner-内部网页
      closeable: true,
    })
  }

  function handleOpenBookEdit(r: Dm.Doc) {
    const url = `/admin/dm/doc/edit/${r.id}`
    addTab({
      key: url,
      path: url,
      name: `编辑-${r.name}`,
      type: 'inner', // iframe, inner-内部网页
      closeable: true,
    })
  }

  function handleBatchAddUsers(ids: number[], users: SelectedUser[], callback: any) {
    const userIds = users.map(i => i.id)
    docUserApi.batchAddUsers(userIds, ids).then(res => {
      FaUtils.showResponse(res, "批量添加用户")
      callback();
      fetchPageList()
    })
  }

  function handleBatchRemoveUsers(ids: number[], users: SelectedUser[], callback: any) {
    const userIds = users.map(i => i.id)
    docUserApi.batchRemoveUsers(userIds, ids).then(res => {
      FaUtils.showResponse(res, "批量删除用户")
      callback();
      fetchPageList()
    })
  }

  /** 生成表格字段List */
  function genColumns() {
    const {sorter} = queryParams;
    return [
      BaseTableUtils.genIdColumn('ID', 'id', 70, sorter),
      BaseTableUtils.genSimpleSorterColumn('文档名称', 'name', undefined, sorter),
      {
        ...BaseTableUtils.genSimpleSorterColumn('参与用户', 'userList', undefined, sorter),
        tcConditionHide: true,
        render: (_, r) => {
          return (
            r.userList.map((v, index) => (
              <Tooltip key={v.id} title={v.name} placement="top">
                <Avatar
                  size="small"
                  src={v.img ? <img src={fileSaveApi.genLocalGetFilePreview(v.img)} alt={v.name} /> : undefined}
                  gap={0}
                  style={{ backgroundColor: v.img ? 'transparent' : FaUtils.seqColor(index) }}
                >
                  {v.name.substring(0, 1)}
                </Avatar>
              </Tooltip>
            ))
          )
        },
      },
      {
        ...BaseTableUtils.genSimpleSorterColumn('分享码', 'shareCode', 100, sorter),
        render: (v, r) => r.isPublic ? <a target="_blank" href={`/open/dm/doc/view/${v}`}>{v}</a> : null,
      },
      BaseTableUtils.genSimpleSorterColumn('访问次数', 'viewNum', 100, sorter),
      BaseTableUtils.genSimpleSorterColumn('章节访问次数', 'viewChapterNum', 120, sorter),
      BaseTableUtils.genBoolSorterColumn('是否公开', 'isPublic', 100, sorter),
      ...BaseTableUtils.genCtrColumns(sorter),
      ...BaseTableUtils.genUpdateColumns(sorter),
      {
        title: '操作',
        dataIndex: 'menu',
        render: (_, r) => (
          <Space>
            <FaHref onClick={() => handleOpenBookView(r)} icon={<EyeOutlined/>} text="查看"/>
            <FaHref onClick={() => handleOpenBookEdit(r)} icon={<BookOutlined/>} text="编写"/>
            <BaseDrawer title="文档用户列表" triggerDom={<FaHref icon={<UsergroupAddOutlined/>} text="用户"/>}>
              <DocUserList doc={r}/>
            </BaseDrawer>
            <DocModal editBtn title={`编辑${serviceName}信息`} record={r} fetchFinish={fetchPageList}/>
            <AuthDelBtn handleDelete={() => handleDelete(r.id)}/>
          </Space>
        ),
        width: 280,
        fixed: 'right',
        tcRequired: true,
        tcType: 'menu',
      },
    ] as FaberTable.ColumnsProp<Dm.Doc>[];
  }

  return (
    <div className="fa-full-content fa-flex-column fa-bg-white">
      <div style={{display: 'flex', alignItems: 'center', position: 'relative', padding: 8}}>
        <div className="fa-h3">{serviceName}管理</div>
        <div style={{flex: 1, display: 'flex', justifyContent: 'flex-end'}}>
          <Form form={form} layout="inline" onFinish={setFormValues}>
            <Form.Item name="name" label="文档名称">
              <Input placeholder="请输入文档名称" allowClear style={{width: 170}}/>
            </Form.Item>
            <Form.Item name="shareCode" label="分享码">
              <Input placeholder="请输入分享码" allowClear style={{width: 170}}/>
            </Form.Item>
            <Form.Item name="isPublic" label="是否公开">
              <BaseBoolSelector placeholder="请选择是否公开" allowClear style={{width: 170}}/>
            </Form.Item>

            <Space>
              <Button htmlType="submit" loading={loading} icon={<SearchOutlined/>}>查询</Button>
              <Button onClick={() => clearForm(form)}>重置</Button>
              <DocModal addBtn title={`新增${serviceName}信息`} fetchFinish={fetchPageList}/>
              <Button loading={exporting} icon={<DownloadOutlined/>} onClick={fetchExportExcel}>导出</Button>
            </Space>
          </Form>
        </div>
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
        onRow={r => ({ onDoubleClick: () => handleOpenBookEdit(r) })}
        renderCheckBtns={rowKeys => (
          <Space>
            <BizUserSelect onChange={(users, callback) => handleBatchAddUsers(rowKeys, users, callback)}>
              <Button icon={<PlusOutlined />}>批量添加用户</Button>
            </BizUserSelect>
            <BizUserSelect onChange={(users, callback) => handleBatchRemoveUsers(rowKeys, users, callback)}>
              <Button icon={<DeleteOutlined />}>批量删除用户</Button>
            </BizUserSelect>
          </Space>
        )}
      />
    </div>
  );
}
