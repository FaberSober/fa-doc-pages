import React, { useEffect } from 'react';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Form, Input, Space } from 'antd';
import { AuthDelBtn, BaseBizTable, BaseTableUtils, BizUserSelect, clearForm, FaberTable, FaUtils, SelectedUser, useDelete, useTableQueryParams, } from '@fa/ui';
import { Dm } from '@/types';
import { docUserApi as api } from '@/services';

const serviceName = '文档用户';
const biz = 'DocUserList';


export interface DocUserListProps {
  doc: Dm.Doc,
}

/**
 * @author xu.pengfei
 * @date 2023/7/15 15:19
 */
export default function DocUserList({doc}: DocUserListProps) {
  const [form] = Form.useForm();

  const { queryParams, setFormValues, setExtraParams, handleTableChange, fetchPageList, loading, list, paginationProps } =
    useTableQueryParams<Dm.DocUserRetVo>(
      api.pageVo,
      { extraParams: { docId: doc.id }, sorter: { field: 'crtTime', order: 'descend' } },
      serviceName,
    );

  useEffect(() => {
    setExtraParams({ docId: doc.id });
  }, [doc]);

  const [handleDelete] = useDelete<number>(api.remove, fetchPageList, serviceName);

  function handleAddUsers(users: SelectedUser[], callback: any, error: any) {
    api.addUsers(users.map((i) => i.id), doc.id).then((res) => {
      FaUtils.showResponse(res, '添加用户');
      callback();
      fetchPageList();
    }).catch(() => error());
  }

  /** 生成表格字段List */
  function genColumns() {
    const { sorter } = queryParams;
    return [
      BaseTableUtils.genSimpleSorterColumn('用户名称', 'name', 150, sorter),
      BaseTableUtils.genSimpleSorterColumn('用户账户', 'username', undefined, sorter),
      ...BaseTableUtils.genCtrColumns(sorter),
      ...BaseTableUtils.genUpdateColumns(sorter),
      {
        title: '操作',
        dataIndex: 'opr',
        render: (_, record) => (
          <Space>
            {record.userId !== doc.crtUser && <AuthDelBtn handleDelete={() => handleDelete(record.id)} />}
          </Space>
        ),
        width: 80,
        fixed: 'right',
        tcRequired: true,
        tcType: 'menu',
      },
    ] as FaberTable.ColumnsProp<Dm.DocUserRetVo>[];
  }

  return (
    <div className="fa-full-content fa-flex-column fa-bg-white">
      <div className="fa-flex-row-center fa-p8">
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Form form={form} layout="inline" onFinish={setFormValues}>
            <Form.Item name="name" label="用户名称">
              <Input placeholder="请输入用户名称" />
            </Form.Item>
          </Form>

          <Space>
            <Button onClick={() => form.submit()} loading={loading} icon={<SearchOutlined />}>
              查询
            </Button>
            <Button onClick={() => clearForm(form)}>重置</Button>
            <BizUserSelect onChange={handleAddUsers}>
              <Button icon={<PlusOutlined />} type="primary">
                新增用户
              </Button>
            </BizUserSelect>
          </Space>
        </div>
      </div>

      <BaseBizTable
        biz={biz}
        columns={genColumns()}
        pagination={paginationProps}
        loading={loading}
        dataSource={list}
        rowKey={(item) => item.id}
        onChange={handleTableChange}
        refreshList={() => fetchPageList()}
        batchDelete={(ids) => api.removeBatchByIds(ids)}
        showComplexQuery={false}
        rowSelection={{
          getCheckboxProps: (record: Dm.DocUserRetVo) => ({
            disabled: record.userId === doc.crtUser, // Column configuration not to be checked
            name: record.name,
          }),
        }}
      />
    </div>
  );
}
