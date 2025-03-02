import React from 'react'

const page = () => {
  return (
    <div className="flex">
      <div className="flex flex-col space-y-3 max-w-6xl w-full pr-8">
        <h1 className="font-bold text-2xl">Changelog</h1>
        <h2 className="font-bold">2/22/25</h2>
        <p>
          We improved <strong>UI Based Experienced</strong> to enhanced user interaction. <br/>
          also fix some known issue related to the application
        </p>
        <h2 className="font-bold">2/12/25</h2>
        <p>
          We added <strong>File Handling Management</strong> to maintain user experience. <br/>
          this involves search bar functionality to easily located the File and etc..
        </p>
        {/* <h2 className="font-bold">2/10/25</h2>
        <p>
          We include <strong>Rate Limiting</strong> to our APIs to protect from abuse. <br/>
          It involves setting a maximum threshold on the number of requests a client can make within a specified timeframe.
        </p> */}
      </div>
      <aside className="hidden ml-10 lg:block">
        <div className="sticky top-16 mb-8 w-52 p-4">
          <h1 className="mb-2 text-sm font-medium text-start">On This Page</h1>
          <nav className="text-sm">
            <p className="block py-1 font-medium">Changelog</p>
            <div className="text-muted-foreground">
              {/* <p className="block py-1 ml-4">2/10/25</p>
              <p className="block py-1 ml-8">Rate Limiting</p> */}
              <p className="block py-1 ml-4">2/12/25</p>
              <p className="block py-1 ml-8">File Handling Management</p>
              <p className="block py-1 ml-4">2/22/25</p>
              <p className="block py-1 ml-8">UI Based Experienced</p>
            </div>
          </nav>
        </div>
      </aside>
    </div>
  )
}

export default page