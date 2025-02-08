import React from "react";

const page = () => {
  return (
    <div className="flex">
      <div className="flex flex-col space-y-3 max-w-6xl w-full pr-8">
        <h1 className="font-bold text-2xl">About Us</h1>
        <h2 className="font-bold">🎯 Our Vision</h2>
        <p>
          To revolutionize system performance through innovative RAG
          implementation <br />
          Ensuring consumer achieve optimal efficiency and cost-effectiveness..
        </p>
        <h3 className="font-bold">🎯 Our Mission</h3>
        <p>
          Our mission is to provide better performance with the quality of RAG.{" "}
          <br />
          We believe in innovation, integrity, and efficiency, <br />
          striving to make a meaningful impact in system optimization.
        </p>
      </div>
      <aside className="hidden ml-10 lg:block">
        <div className="sticky top-16 mb-8 w-52 p-4">
          <h1 className="mb-2 text-sm font-medium text-start">On This Page</h1>
          <nav className="text-sm">
            <p className="block py-1 font-medium">About us</p>
            <div className="text-muted-foreground">
              <p className="block py-1 ml-4">Our Vision</p>
              <p className="block py-1 ml-4">Our Mission</p>
            </div>
          </nav>
        </div>
      </aside>
    </div>
  );
};

export default page;
