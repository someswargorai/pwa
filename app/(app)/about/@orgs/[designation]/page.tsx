'use client';

import { useParams } from 'next/navigation'
import React from 'react'

function Page() {
  const params = useParams();
  return (
    <div>
        {params.designation}
    </div>
  )
}

export default Page;