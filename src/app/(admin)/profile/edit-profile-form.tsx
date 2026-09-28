"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { updateProfileAction } from "./actions";

type EditProfileFormProps = {
  initialValues: {
    firstName: string;
    lastName: string;
    phone: string;
    jobTitle: string;
  };
};

export function EditProfileForm({
  initialValues,
}: EditProfileFormProps) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState(initialValues);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  function cancelEditing() {
    setForm(initialValues);
    setMessage("");
    setSuccess(false);
    setEditing(false);
  }

  function submit() {
    setMessage("");
    setSuccess(false);

    startTransition(async () => {
      const result = await updateProfileAction(form);

      setMessage(result.message);
      setSuccess(result.success);

      if (result.success) {
        setEditing(false);
      }
    });
  }

  return (
    <Card>
      <CardHeader className="border-b px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-base">
              Personal information
            </CardTitle>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Manage the professional details associated with
              your TaxReady account.
            </p>
          </div>

          {!editing && (
            <Button
  type="button"
  size="sm"
  className="shadow-sm"
  onClick={() => {
    setMessage("");
    setSuccess(false);
    setEditing(true);
  }}
>
  <Pencil className="size-4" />
  Edit profile
</Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-5 py-6 sm:px-6">
        {editing ? (
          <div className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First name
                </Label>

                <Input
                  id="firstName"
                  value={form.firstName}
                  maxLength={80}
                  autoComplete="given-name"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      firstName: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last name
                </Label>

                <Input
                  id="lastName"
                  value={form.lastName}
                  maxLength={80}
                  autoComplete="family-name"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      lastName: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone number
                </Label>

                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  maxLength={30}
                  autoComplete="tel"
                  placeholder="+92 300 1234567"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle">
                  Job title
                </Label>

                <Input
                  id="jobTitle"
                  value={form.jobTitle}
                  maxLength={100}
                  placeholder="Tax Consultant"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      jobTitle: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {message && (
              <div
                className={[
                  "rounded-lg border px-4 py-3 text-sm",
                  success
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-destructive/20 bg-destructive/5 text-destructive",
                ].join(" ")}
              >
                {message}
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-2 border-t pt-5">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={cancelEditing}
              >
                Cancel
              </Button>

              <Button
                type="button"
                disabled={isPending}
                onClick={submit}
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-x-12 gap-y-6 sm:grid-cols-2">
              <Detail
                label="First name"
                value={form.firstName}
              />

              <Detail
                label="Last name"
                value={form.lastName}
              />

              <Detail
                label="Phone number"
                value={form.phone || "Not provided"}
              />

              <Detail
                label="Job title"
                value={form.jobTitle || "Not provided"}
              />
            </div>

            {message && success && (
  <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
    <CheckCircle2 className="size-4 shrink-0" />
    {message}
  </div>
)}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-medium text-foreground">
        {value}
      </p>
    </div>
  );
}