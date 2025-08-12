import { AdminPanel } from "../_components/panel";

export default function AdminLivePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Live event</h1>
      <p className="mt-2 text-zinc-300">Toggle live, moderate requests, mark played.</p>
      <div className="mt-6">
        <AdminPanel />
      </div>
    </div>
  );
}

