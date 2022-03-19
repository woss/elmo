import React, { Props } from 'react'

function BoldText({ children }: Props<{}>) {
  return <span style={{ fontWeight: 'bold' }}>{children}</span>
}

export default BoldText
