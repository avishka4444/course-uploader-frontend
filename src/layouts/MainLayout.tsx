import { Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const MainLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 pb-16">
      {/* Fixed header with username and logout in top right */}
      <header className="fixed top-0 right-0 left-0 z-10 flex items-center justify-end gap-4 px-6 py-4">
        {user && (
          <div className="text-sm text-slate-400">
            <span className="text-slate-300">{user.username}</span>
          </div>
        )}
        <button
          onClick={logout}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-primary-400 hover:text-primary-200"
        >
          Logout
        </button>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 pt-24 pb-12">
        <div className="flex flex-col gap-4 text-center">
          <span className="self-center rounded-full border border-primary-400/30 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-primary-200">
            File Management Portal
          </span>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Upload & Manage Files
          </h1>
          <p className="text-base text-slate-400 sm:text-lg">
            Securely upload documents, videos, and images. Track metadata and
            download your files anytime.
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;

