import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

export function EditProfileDialog({ profile, onSave, triggerClassName }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(profile?.name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [avatar, setAvatar] = useState(profile?.avatar || "");

  function handleOpenChange(next) {
    setOpen(next);
    if (next) {
      setName(profile?.name || "");
      setBio(profile?.bio || "");
      setAvatar(profile?.avatar || "");
    }
  }

  function submit(e) {
    e.preventDefault();
    const updated = { ...profile, name: name.trim(), bio: bio.trim(), avatar: avatar.trim() };
    onSave?.(updated);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={triggerClassName}>Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Display name</label>
            <Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Avatar URL</label>
            <Input value={avatar} onChange={(e)=>setAvatar(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <Textarea value={bio} onChange={(e)=>setBio(e.target.value)} placeholder="Tell others about you" className="min-h-28" />
          </div>
          <div className="pt-2">
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Save changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
