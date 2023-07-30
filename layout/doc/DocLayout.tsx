import React, {createContext} from 'react';
import {Dm} from '@/types';
import {Fa} from "@fa/ui";


export interface DocLayoutContextProps {
  doc: Dm.Doc;
}

export const DocLayoutContext = createContext<DocLayoutContextProps>({} as any);


export interface DocLayoutProps extends Fa.BaseChildProps {
  doc: Dm.Doc;
}

/**
 * 登录后的用户上下文
 * @author xu.pengfei
 * @date 2022/9/21
 */
export default function DocLayout({doc, children}: DocLayoutProps) {
  const contextValue: DocLayoutContextProps = {
    doc
  };

  return (
    <DocLayoutContext.Provider value={contextValue}>
      {children}
    </DocLayoutContext.Provider>
  );
}
