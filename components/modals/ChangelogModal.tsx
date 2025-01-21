"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ChangelogModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangelogModal({ isOpen, onOpenChange }: ChangelogModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border text-foreground max-w-lg">
        <DialogHeader>
          <DialogTitle>Changelog</DialogTitle>
          <DialogDescription>See what’s new or what’s changed.</DialogDescription>
        </DialogHeader>

        {/* Changelog content here */}
        <div className="mt-4 space-y-2">
          <p className="text-sm text-muted-foreground">
            This is an example of how you can show version updates, new features, bug fixes, etc.
          </p>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li><strong>v0.2.0</strong> – Added user authentication and theming options.</li>
            <li><strong>v0.1.5</strong> – Improved performance on canvas rendering.</li>
            <li><strong>v0.1.0</strong> – Initial release with basic canvas features.</li>
          </ul>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
