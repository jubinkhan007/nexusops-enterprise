import React from 'react';

function Error({ statusCode }: { statusCode?: number }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold text-amber-500 mb-2">
        {statusCode ? `An error ${statusCode} occurred on server` : 'An error occurred on client'}
      </h1>
      <p className="text-slate-400 text-sm">Please refresh the page or return to the dashboard.</p>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
