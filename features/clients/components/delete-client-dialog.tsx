"use client";

import React from "react";
import { ClientListItem } from "@/types/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteDialogTarget {
  type: "single" | "many";
  client?: ClientListItem;
  count: number;
}

interface DeleteClientDialogProps {
  open: boolean;
  target: DeleteDialogTarget | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteClientDialog({
  open,
  target,
  onOpenChange,
  onConfirm,
}: DeleteClientDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {target?.type === "single"
              ? `Supprimer "${target?.client?.name}" ?`
              : `Supprimer ${target?.count} contact${(target?.count ?? 0) > 1 ? "s" : ""} ?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {target?.type === "single"
              ? "Ce contact et toutes ses données associées seront définitivement supprimés. Cette action est irréversible."
              : `Les ${target?.count} contact${(target?.count ?? 0) > 1 ? "s" : ""} sélectionné${(target?.count ?? 0) > 1 ? "s" : ""} et toutes leurs données associées seront définitivement supprimés. Cette action est irréversible.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 dark:bg-red-700 hover:bg-red-700 text-white"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export type { DeleteDialogTarget };