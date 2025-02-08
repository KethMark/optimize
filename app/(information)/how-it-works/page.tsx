import React from "react";

const page = () => {
  return (
    <div className="flex">
      <div className="flex flex-col w-full max-w-6xl space-y-3 pr-8">
        <h1 className="font-bold text-2xl">How It Works</h1>
        <h2 className="font-bold">🎯 Easy Authentication</h2>
        <p>
          Sign in quickly using your email and password <br />
          Or authenticate instantly with your GitHub account <br />
          Secure access to all OPTIMIZE features with one-click login. <br />
        </p>
        <h3 className="font-bold">🎯 Document Upload</h3>
        <p>
          Upload your PDF documents (up to 1MB per file) <br />
          Supported formats: PDF files with text content <br />
          Advanced document processing ensures quick analysis <br />
          Real-time progress tracking during upload.
        </p>
        <h4 className="font-bold">🎯 Interactive Chat Experience</h4>
        <p>
          Start conversations about your uploaded documents immediately <br />
          Ask specific questions about any part of your PDF <br />
          Get precise answers with direct references to your document <br />
          Follow-up questions for deeper understanding.
        </p>
      </div>
      <aside className="hidden ml-10 lg:block">
        <div className="sticky top-16 mb-8 w-52 p-4">
          <h1 className="mb-2 text-sm font-medium text-start">On This Page</h1>
          <nav className="text-sm">
            <p className="block py-1 font-medium">
              How It Works
            </p>
            <div className="text-muted-foreground">
              <p className="block py-1 ml-4">
                Easy Authentication
              </p>
              <p className="block py-1 ml-4">
                Document Upload
              </p>
              <p className="block py-1 ml-4">
                Interactive Chat Experience
              </p>
            </div>
          </nav>
        </div>
      </aside>
    </div>
  );
};

export default page;
