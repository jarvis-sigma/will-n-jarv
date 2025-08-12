import { AddEventForm } from "./_components/form-add-event";
import { ManageEvents } from "./_components/manage-events";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AdminEventsPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold text-white">Manage events</h1>
      <p className="mt-2 text-zinc-300">Create, update, delete upcoming events.</p>

      {/* Add event box with modal trigger */}
      <div className="mt-6 max-w-xl rounded-2xl border border-white/10 bg-white/[.03] p-4">
        <h2 className="text-xl font-semibold text-white mb-3">Add event</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-white text-black hover:bg-neutral-200">Add event</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add event</DialogTitle>
            </DialogHeader>
            <AddEventForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-10">
        <ManageEvents />
      </div>
    </div>
  );
}

