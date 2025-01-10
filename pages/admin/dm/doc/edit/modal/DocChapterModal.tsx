import React, { useContext, useEffect, useState } from 'react';
import { get } from 'lodash';
import { Form, Input } from 'antd';
import { ApiEffectLayoutContext, DragModal, type DragModalProps, FaUtils } from '@fa/ui';
import { docChapterApi as api } from '@/services';
import type { Admin } from '@/types';
import {DocChapterCascade} from "@features/fa-doc-pages/components";
import {DocLayoutContext} from "@features/fa-doc-pages/layout/doc/DocLayout";


const serviceName = '章节';

interface IProps extends DragModalProps {
  parentId?: number;
  title?: string;
  record?: Admin.Dict;
}

/**
 * Tree数据新增、编辑弹框
 */
export default function DocChapterModal({ children, parentId, title, record, ...props }: IProps) {
  const { loadingEffect } = useContext(ApiEffectLayoutContext);
  const [form] = Form.useForm();

  const {doc} = useContext(DocLayoutContext)
  const [open, setOpen] = useState(false);

  /** 新增Item */
  function invokeInsertTask(params: any) {
    api.save(params).then((res) => {
      FaUtils.showResponse(res, `新增${serviceName}`);
      setOpen(false);
      if (props.onCancel) props.onCancel(params);
    });
  }

  /** 更新Item */
  function invokeUpdateTask(params: any) {
    api.update(params.id, params).then((res) => {
      FaUtils.showResponse(res, `更新${serviceName}`);
      setOpen(false);
      if (props.onCancel) props.onCancel(params);
    });
  }

  /** 提交表单 */
  function onFinish(fieldsValue: any) {
    const values = {
      ...fieldsValue,
    };
    if (record) {
      invokeUpdateTask({ ...record, ...values });
    } else {
      invokeInsertTask({ ...values, docId: doc.id });
    }
  }

  function getInitialValues() {
    return {
      name: get(record, 'name'),
      parentId: get(record, 'parentId', parentId || 0),
    };
  }

  function showModal() {
    setOpen(true);
    form.setFieldsValue(getInitialValues());
  }

  useEffect(() => {
    form.setFieldsValue(getInitialValues());
  }, [props.open]);

  const loading = loadingEffect[api.getUrl('save')] || loadingEffect[api.getUrl('update')];
  return (
    <span>
      <span onClick={showModal}>{children}</span>
      <DragModal
        title={title}
        open={open}
        onOk={() => form.submit()}
        confirmLoading={loading}
        onCancel={() => setOpen(false)}
        width={700}
        {...props}
      >
        <Form form={form} onFinish={onFinish}>
          <Form.Item name="parentId" label="上级节点" rules={[{ required: true }]} {...FaUtils.formItemFullLayout}>
            <DocChapterCascade showRoot />
          </Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true }]} {...FaUtils.formItemFullLayout}>
            <Input />
          </Form.Item>
        </Form>
      </DragModal>
    </span>
  );
}
