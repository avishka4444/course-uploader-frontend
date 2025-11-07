import { FileTable } from "./components/FileTable";
import { UploadForm } from "./components/UploadForm";

const App = () => (
  <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 pb-16">
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-4 text-center">
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
      </header>

      <UploadForm />

      <FileTable />
    </div>
  </div>
);

export default App;
