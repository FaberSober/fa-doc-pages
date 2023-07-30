import React, { useContext, useState } from 'react';
import { get } from 'lodash';
import { Button, Form, Input } from 'antd';
import {EditOutlined, PlusOutlined} from "@ant-design/icons";
import {DragModal, FaHref, ApiEffectLayoutContext, FaUtils, CommonModalProps, BaseBoolRadio} from '@fa/ui';
import { docApi as api } from '@/services';
import { Dm } from '@/types';


/**
 * DOC-文档实体新增、编辑弹框
 */
export default function DocModal({ children, title, record, fetchFinish, addBtn, editBtn, ...props }: CommonModalProps<Dm.Doc>) {
  const {loadingEffect} = useContext(ApiEffectLayoutContext)
  const [form] = Form.useForm();

  const [open, setOpen] = useState(false);

  /** 新增Item */
  function invokeInsertTask(params: any) {
    api.save(params).then((res) => {
      FaUtils.showResponse(res, '新增DOC-文档');
      setOpen(false);
      if (fetchFinish) fetchFinish();
    })
  }

  /** 更新Item */
  function invokeUpdateTask(params: any) {
    api.update(params.id, params).then((res) => {
      FaUtils.showResponse(res, '更新DOC-文档');
      setOpen(false);
      if (fetchFinish) fetchFinish();
    })
  }

  /** 提交表单 */
  function onFinish(fieldsValue: any) {
    const values = {
      ...fieldsValue,
      // birthday: FaUtils.getDateStr000(fieldsValue.birthday),
    };
    if (record) {
      invokeUpdateTask({ ...record, ...values });
    } else {
      invokeInsertTask({ ...values });
    }
  }

  function getInitialValues() {
    return {
      name: get(record, 'name'),
      isPublic: get(record, 'isPublic'),
      shareCode: get(record, 'shareCode'),
      // birthday: FaUtils.getInitialKeyTimeValue(record, 'birthday'),
    }
  }

  function handleGenShareCode() {
    form.setFieldValue("shareCode", FaUtils.generateId(4))
  }

  function showModal() {
    setOpen(true)
    form.setFieldsValue(getInitialValues())
  }

  const loading = loadingEffect[api.getUrl('save')] || loadingEffect[api.getUrl('update')];
  return (
    <span>
      <span onClick={showModal}>
        {children}
        {addBtn && <Button icon={<PlusOutlined />} type="primary">新增</Button>}
        {editBtn && <FaHref icon={<EditOutlined />} text="编辑" />}
      </span>
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
          <Form.Item name="name" label="文档名称" rules={[{ required: true }]} {...FaUtils.formItemFullLayout}>
            <Input placeholder="请输入文档名称" />
          </Form.Item>
          <Form.Item name="isPublic" label="是否公开" rules={[{ required: true }]} {...FaUtils.formItemFullLayout}>
            <BaseBoolRadio />
          </Form.Item>
          <Form.Item name="shareCode" label="分享码" rules={[{ required: false, max: 32 }]} {...FaUtils.formItemFullLayout}>
            <Input placeholder="请输入分享码" addonAfter={<a onClick={() => handleGenShareCode()}>生成分享码</a>} />
          </Form.Item>
        </Form>
      </DragModal>
    </span>
  )
}
