import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <div className='max-w-2xl p-5 mx-auto'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Icon.Optimize/>
          <p className='text-lg'>Optimize</p>
        </div>
        <Button>
          <Link href='/upload'>
            Start New Chat
          </Link>
        </Button>
      </div>
      <div className='grid grid-cols-1 space-y-2 mt-12'>
        <Input placeholder='Search your file' className='relative h-12 pl-10'/>
        <Search className='absolute ml-2 top-[7rem]'/>
      </div>
    </div>
  )
}

export default page