import { ToolsGroupType } from 'kgsheet/dist/toolBar/interface';
import React from 'react';
import Tool from './tool';

interface Props {
  group: ToolsGroupType;
}

export default function Group({ group }: Props) {
  return (
    <div className='kgsheet_toolBar_group'>
      {group.tools.map((tool) => {
        return <Tool tool={tool} group={group} key={tool.key} />;
      })}
    </div>
  );
}
